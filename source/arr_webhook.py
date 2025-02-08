import logging
import classy_fastapi as cfa

from source.path_converter import PathConverter
from source.plex_scan import PlexScan
from fastapi import FastAPI, Response, Request, Body

logging.basicConfig(format="[%(levelname)s %(name)s] %(message)s", level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ArrWebhook(cfa.Routable):
    def __init__(self, plex: PlexScan, path_converter: PathConverter):
        super().__init__()
        self.plex = plex
        self.path_converter = path_converter

    @cfa.put('/')
    @cfa.post('/')
    async def webhook_handler(self, request: Request, notification: dict = Body(...)):

        agent = request.headers.get('user-agent')
        address = request.client
        eventType = notification.get("eventType") if notification.get("eventType") else "Unknown"
        logger.info(f"Rx Event {eventType} from {agent} at {request.scope['client']} ")
        arr_path = None
        ignoredEventTypes = ["Grab", "Test"]

        if eventType == "Unknown" and notification.get("path"):
            arr_path = await self.plex.scan_path(notification['path'])
        elif not eventType in ignoredEventTypes:
            if agent.startswith("Sonarr") and notification.get('series'):
                arr_path = notification['series']['path']
            elif agent.startswith("Radarr") and notification.get('movie'):
                arr_path = notification['movie']['folderPath']
            elif agent.startswith("Lidarr") and notification.get('artist'):
                arr_path = notification['artist']['path']
            elif agent.startswith("Readarr") and notification.get('author'):
                arr_path = notification['author']['path']

        if arr_path:
            plex_path = self.path_converter.convert(arr_path)
            logger.info(f"Converted {arr_path} to {plex_path} and requesting scan")
            await self.plex.scan_path(plex_path)

        #elif eventType in ignoredEventTypes:  # don't dump ignored types to logs
        #    scanned = True

        #if scanned:
        #    logger.debug(f"Event Json: {notification}")
        #else:
        #    logger.info(f"Event Json: {notification}")

        return 'Hook accepted'