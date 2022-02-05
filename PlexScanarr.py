import logging
import plexapi
import json
import yaml
import os
from plexapi.server import PlexServer
from flask import Flask, request, json


app = Flask(__name__)

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

    plexPath = transformToPlexPath(notificationPath)

    for section in sections:
        for location in section.locations:
            if notificationPath.startswith(location):
                logger.info(f"Requesting Scan {plexPath} in {section.title}")
                section.update(plexPath)


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

@app.route('/', methods=['POST','GET'])
def handler():
    global sections, plex

    if request.method == 'GET':
        return webPage()
    if request.method == "POST":

        notification = json.loads(request.data)
        logger.info(notification)

        if notification.get("eventType"):
            eventType = notification['eventType']
            if not eventType == "Grab":
                if notification.get("series"):
                    #filePath = os.path.join(normalizeFolders(notification['series']['path']), notification['episodeFile']['relativePath'])
                    scanPlex(notification['series']['path'])
                elif notification.get("movie"):
                    scanPlex(notification['movie']['folderPath'])

        return 'Hook accepted'


if __name__ == '__main__':
    global sections, plex, config

    f = open('config.yaml', 'r')
    config = yaml.safe_load(f)

    plex = PlexServer(config["plex-server"], config["plex-token"])
    sections = plex.library.sections()

    logger.info(f"Connected to {plex.friendlyName} running: {plex.platform} version: {plex.version}")

    port = config.get("port") if config.get("port") else 5000
    host = config.get("listen-address") if config.get("listen-address") else "0.0.0.0"
    app.run(debug=True, host=host, port=port)
    