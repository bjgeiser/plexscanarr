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

    @cfa.post('/')
    async def webhook_handler(self, request: Request, notification: dict = Body(...)):

        logger.debug(f"Received webhook request: {notification}")
        agent = request.headers.get('user-agent')
        address = request.client
        event_type = notification.get("eventType") if notification.get("eventType") else "Unknown"
        logger.info(f"Rx Event {event_type} from {agent} at {request.scope['client']} ")
        arr_path = None
        ignored_event_types = ["Grab", "Test"]

        if event_type == "Unknown" and notification.get("path"):
            arr_path = await self.plex.scan_path(notification['path'])
        elif not event_type in ignored_event_types:
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

        return 'Hook accepted'

    @cfa.put('/')
    async def put_webhook_handler(self, request: Request, notification: dict = Body(...)):
        return await self.webhook_handler(request, notification)