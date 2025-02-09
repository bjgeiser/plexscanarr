import logging
import json
import datetime

import classy_fastapi as cfa

from path_converter import PathConverter
from plex_scan import PlexScan
from fastapi import Request, Body

from source.arr_notification import ArrNotificationModel, ArrSource
from source.plex_websocket import PlexWebsocket

logger = logging.getLogger(__name__)


class ArrWebhook(cfa.Routable):
    def __init__(self, plex: PlexScan, path_converter: PathConverter, plex_websocket: PlexWebsocket):
        super().__init__()
        self.plex = plex
        self.path_converter = path_converter
        self.plex_websocket = plex_websocket

    @cfa.post("/")
    async def webhook_handler(self, request: Request, notification: dict = Body(...)):
        logger.debug(f"Received webhook request: {notification}")
        agent = request.headers.get("user-agent")
        address = request.client
        event_type = notification.get("eventType") if notification.get("eventType") else "Unknown"
        logger.info(f"Rx Event {event_type} from {agent} at {request.scope['client']} ")
        arr_path = None
        ignored_event_types = ["Grab"]
        arr_notification = None

        if event_type == "Unknown" and notification.get("path"):
            arr_path = await self.plex.scan_path(notification["path"])
        elif event_type not in ignored_event_types:
            if agent.startswith("Sonarr") and notification.get("series"):
                arr_path = notification["series"]["path"]
                arr_notification = ArrNotificationModel(
                    file_path=arr_path,
                    type=ArrSource.SONARR,
                    cover_art_url="https://res.cloudinary.com/razordarkamg/image/upload/v1621212884/SonarrV3_pufacd.png",
                    server_name=notification["instanceName"],
                    timestamp=datetime.datetime.now(datetime.UTC),
                    pretty_name=f"{notification['series']['title']}:{notification['episodes'][0]['title']}",
                    original_json=notification,
                )
            elif agent.startswith("Radarr") and notification.get("movie"):
                arr_path = notification["movie"]["folderPath"]
            elif agent.startswith("Lidarr") and notification.get("artist"):
                arr_path = notification["artist"]["path"]
            elif agent.startswith("Readarr") and notification.get("author"):
                arr_path = notification["author"]["path"]

        if arr_path:
            plex_path = self.path_converter.convert(arr_path)
            logger.info(f"Converted {arr_path} to {plex_path} and requesting scan")
            await self.plex.scan_path(plex_path)
        if arr_notification:
            await self.plex_websocket.send_arr_notification(arr_notification)

        return "Hook accepted"

    @cfa.put("/")
    async def put_webhook_handler(self, request: Request, notification: dict = Body(...)):
        return await self.webhook_handler(request, notification)
