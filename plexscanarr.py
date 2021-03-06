import argparse
import json
import logging
import os
import sys
import time
import string

import plexapi
import uvicorn
import yaml
from fastapi import FastAPI, Response, Request, Body
from fastapi.responses import RedirectResponse, FileResponse, StreamingResponse
from plexapi.server import PlexServer

app = FastAPI()

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

STOP_EMOJI_HTML = "&#x1F6D1;"
MAGNIFY_EMOJI_HTML = "&#x1F50E;"

def normalizeSlashes(path, plexPath):
    if "\\" in plexPath:
        return path.replace("/", "\\")
    else:
        return path.replace("\\", "/")


def normalizeFolders(path):
    if "\\" in path:
        if not path.endswith("\\"):
            path = path + "\\"
    else:
        if not path.endswith("/"):
            path = path + "/"
    return path

def getFolderPath(path):
    root, ext = os.path.splitext(path)
    if ext:
        path = os.path.dirname(root)
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
    global plex, config
    scanned = False
    sections = plex.library.sections()

    plexPath = transformToPlexPath(notificationPath)
    if plexPath != notificationPath:
        logger.info(f"Path transformed from: {notificationPath} to {plexPath}")

    for section in sections:
        for location in section.locations:
            if plexPath.startswith(location):
                if config.get("preempt-active-scan"):
                    cancel = False
                    for s in sections:
                        if s.refreshing:
                            cancel = True
                            logger.info(f"Preempt scan in {s.title}, canceling")
                    if cancel:
                        logger.info(f"Canceling all active scans in order to handle requested scan")
                        plex.library.cancelUpdate()

                logger.info(f"Requesting Scan {plexPath} in {section.title}")
                section.update(plexPath)
                scanned = True

    if not scanned:
        logger.info(f"No matches found for {notificationPath}")
    return scanned

def human_readable_filesize(size, decimal_places=2):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB', 'PB']:
        if size < 1024.0 or unit == 'PB':
            break
        size /= 1024.0
    return f"{size:.{decimal_places}f} {unit}"

@app.get('/')
def mainPage():
    global plex
    sections = plex.library.sections()
    totalItems = 0

    def loadMainPage():
        scanning = False
        for section in sections:
            if section.refreshing:
                scanning = True
                break

        scanStatus = "Idle" if not scanning else "Scanning"
        scanCommand = f"<a href=/scan>{MAGNIFY_EMOJI_HTML}</a>" if not scanning else f"<a href=/stop>{STOP_EMOJI_HTML}</a>"

        with open('web/main.html', 'r') as file:
            yield f"{file.read()}".format(**globals(), **locals())

        for section in sections:
            yield f"<tr><td><a href=/section/{section.key}>{section.title}</a></td><td>"
            for location in section.locations:
                yield f"{location}<br>"
            scanning = f"<a href=/section/{section.key}/stop>{STOP_EMOJI_HTML}<a>" if section.refreshing else f"<a href=/section/{section.key}/scan>{MAGNIFY_EMOJI_HTML}</a>"
            yield f"<td>{scanning}</td>"
            yield "</td></tr>"

        yield "</table></body></html>"

    return StreamingResponse(loadMainPage(), media_type="text/html")



@app.get('/section/{key}/stop')
def stop_scan_handler(key: int):
    global plex
    section = plex.library.sectionByID(key)
    if section:
        section.cancelUpdate()
        time.sleep(1)

    return RedirectResponse(url='/')

@app.get('/section/{key}/scan')
def start_scan_handler(key: int):
    global plex
    section = plex.library.sectionByID(key)
    if section:
        section.update()
        time.sleep(1)

    return RedirectResponse(url='/')

@app.get('/item/{itemKey}/scan')
def item_scan_handler(itemKey: int):
    global plex
    item = plex.fetchItem(itemKey)
    section = plex.library.sectionByID(item.librarySectionID)

    if config.get("preempt-active-scan"):
        cancel = False
        for s in plex.library.sections():
            if s.refreshing:
                cancel = True
                logger.info(f"Preempt scan in {s.title}, canceling")
        if cancel:
            logger.info(f"Canceling all active scans in order to handle requested scan")
            plex.library.cancelUpdate()

    for location in item.locations:
        location = getFolderPath(location)
        logger.info(f"Requesting Manual Scan of Title: {item.title} at {location} in Section: {item.librarySectionTitle}")
        section.update(location)

    time.sleep(1)
    return RedirectResponse(url='/')

@app.get("/stop")
def stop_full_scan():
    global plex
    plex.library.cancelUpdate()
    return RedirectResponse(url='/')

@app.get("/scan")
def start_full_scan():
    global plex
    plex.library.update()
    return RedirectResponse(url='/')

@app.get("/files/{name}")
def get_file(name: str):
    return FileResponse(f"web/files/{name}")


@app.get('/section/{key}')
def section_scanner_handler(key: int):
    global plex
    section = plex.library.sectionByID(key)
    logger.info(f"Loading section page for: {section.title}")

    def loadSectionPage():  #
        tableRows = ""
        humanReadableSize = human_readable_filesize(section.totalStorage)
        count = section.totalSize
        with open('web/section.html', 'r') as file:
            yield f"{file.read()}".format(**globals(), **locals())

        alphabet_list = list("0123456789" + string.ascii_lowercase)
        for letter in alphabet_list:
            items = section.search(filters={"title<": f"{letter}"})

            for item in items:
                yield f"<tr><td>{item.title}</td><td>"
                for location in item.locations:
                    yield f"{getFolderPath(location)}<br>"
                scanning = f"<a href=/item/{item.ratingKey}/scan>{MAGNIFY_EMOJI_HTML}<a>"
                yield f"<td>{scanning}</td>"
                yield "</td></tr>"

        yield "</table></body></html>"

    return StreamingResponse(loadSectionPage(), media_type="text/html")


def get_handler():
    global plex
    sections = plex.library.sections()
    return Response(mainPage())


@app.put('/')
@app.post('/')
def post_handler(request: Request, notification: dict = Body(...)):
    global plex

    agent = request.headers.get('user-agent')
    address = request.client
    eventType = notification.get("eventType") if notification.get("eventType") else "Unknown"
    logger.info(f"Rx Event {eventType} from {agent} at {request.scope['client']} ")
    scanned = False
    ignoredEventTypes = ["Grab", "Test"]

    if eventType == "Unknown" and notification.get("path"):
        scanned = scanPlex(notification['path'])
    elif not eventType in ignoredEventTypes:
        if agent.startswith("Sonarr") and notification.get('series'):
            scanned = scanPlex(notification['series']['path'])
        elif agent.startswith("Radarr") and notification.get('movie'):
            scanned = scanPlex(notification['movie']['folderPath'])
        elif agent.startswith("Lidarr") and notification.get('artist'):
            scanned = scanPlex(notification['artist']['path'])
        elif agent.startswith("Readarr") and notification.get('author'):
            scanned = scanPlex(notification['author']['path'])
    elif eventType in ignoredEventTypes: #don't dump ignored types to logs
        scanned = True

    if scanned:
        logger.debug(f"Event Json: {notification}")
    else:
        logger.info(f"Event Json: {notification}")

    return 'Hook accepted'


if __name__ == '__main__':
    global plex, config

    '''Process command line argurments'''
    parser = argparse.ArgumentParser(description='PlexScanarr', epilog=f'Example of use: {sys.argv[0]} -v')
    parser.add_argument("-v", '--verbose', action='store_true', default=False, help='Verbose logging (Default: off)')
    args = parser.parse_args()

    with open("VERSION", "r") as f:
        logger.info(f"Starting version: {f.read()} of plexscanarr")

    logger.info(f"Command Line Args: {args}")

    f = open('config.yaml', 'r')
    config = yaml.safe_load(f)

    uvicornLog = 'error'
    if args.verbose or config.get("verbose"):
        logger.level = logging.DEBUG
        uvicornLog = "debug"

    try:
        plex = PlexServer(config.get("plex-server"), config.get("plex-token"))
        logger.info(f"Connected to {plex.friendlyName} running: {plex.platform} version: {plex.version}")
    except Exception as e:
        logger.error(f"Failed to connect to plex server Error: {e}")
        logger.debug(e, exc_info=True)
        exit(-1)

    port = config.get("port") if config.get("port") else 5000
    host = config.get("listen-address") if config.get("listen-address") else "0.0.0.0"

    logger.info(f"Starting server at: http://{host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level=uvicornLog, log_config=None)
