import logging
import plexapi
import json
import yaml
import os
from plexapi.server import PlexServer
from fastapi import FastAPI, Response, Request, Body
import uvicorn
import argparse
import sys

app = FastAPI()

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

def normalizeSlashes(path, plexPath):
    if "\\" in plexPath:
        return path.replace("/","\\")
    else:
        return path.replace("\\","/")

def normalizeFolders(path):
    if "\\" in path:
        if not path.endswith("\\"):
            path = path + "\\"
    else:
        if not path.endswith("/"):
            path = path + "/"
    return path

def transformToPlexPath(notificationPath):
    global config
    if config.get('path-converters'):
        for convertPath in config['path-converters']:
            downloadPath = normalizeFolders(convertPath['download-path'])
            plexPath = normalizeFolders(convertPath['plex-path'])

            if notificationPath.startswith(downloadPath):
                remainingPath = notificationPath.replace(downloadPath, "")
                remainingPath = normalizeSlashes(remainingPath, plexPath)
                transformedPath = os.path.join(plexPath, remainingPath)
                return transformedPath

    return notificationPath


def scanPlex(notificationPath):
    global plex, sections
    scanned = False
    sections = plex.library.sections()

    plexPath = transformToPlexPath(notificationPath)
    if plexPath != notificationPath:
        logger.info(f"Path transformed from: {notificationPath} to {plexPath}")

    for section in sections:
        for location in section.locations:
            if plexPath.startswith(location):
                logger.info(f"Requesting Scan {plexPath} in {section.title}")
                section.update(plexPath)
                scanned = True

    if not scanned:
        logger.info(f"Not matches found for {notificationPath}")

def webPage():
    global plex, section
    html = "<b>PlexScanarr</b><br><br>"
    html += f"Connected to: {plex.friendlyName}<br>running: {plex.platform}<br>version: {plex.version}<br><br>"
    html += "<table border=1><tr><td><b>Library</b></td><td><b>Paths</b></td>"
    for section in sections:
        html += f"<tr><td>{section.title}</td><td>"
        for location in section.locations:
            html += f"{location}<br>"
        html += "</td></tr>"
    html += "</table>"

    return html

@app.get('/')
def get_handler():
    global sections, plex
    sections = plex.library.sections()
    return Response(webPage())

@app.put('/')
@app.post('/')
def post_handler(request: Request, notification: dict = Body(...)):
    global sections, plex

    agent = request.headers['user-agent']
    address = request.client
    eventType = notification.get("eventType") if notification.get("eventType") else "Unknown"

    logger.info(f"Rx Event {eventType} from {agent} at {request.scope['client']} ")
    logger.debug(f"Event Json: {notification}")

    if notification.get("eventType"):
        eventType = notification['eventType']
        if not eventType == "Grab":
            if agent.startswith("Sonarr"):
                scanPlex(notification['series']['path'])
            elif agent.startswith("Radarr"):
                scanPlex(notification['movie']['folderPath'])

    return 'Hook accepted'


if __name__ == '__main__':
    global sections, plex, config

    '''Process command line argurments'''
    parser = argparse.ArgumentParser(description='PlexScanarr', epilog=f'Example of use: {sys.argv[0]} -v')
    parser.add_argument("-v", '--verbose', action='store_true', default=False, help='Verbose logging (Default: off)')
    args = parser.parse_args()

    with open("VERSION", "r") as f:
        logger.info(f"Starting version: {f.read()} of PlexScanarr")

    logger.info(f"Command Line Args: {args}")

    uvicornLog = 'error'
    if args.verbose:
        logger.level = logging.DEBUG
        uvicornLog = "debug"

    f = open('config.yaml', 'r')
    config = yaml.safe_load(f)

    plex = PlexServer(config["plex-server"], config["plex-token"])
    sections = plex.library.sections()

    logger.info(f"Connected to {plex.friendlyName} running: {plex.platform} version: {plex.version}")

    port = config.get("port") if config.get("port") else 5000
    host = config.get("listen-address") if config.get("listen-address") else "0.0.0.0"

    uvicorn.run(app, host="0.0.0.0", port=port, log_level=uvicornLog, log_config=None)