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

    @staticmethod
    def human_readable_size(size, decimal_places=2):
        for unit in ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]:
            if size < 1024.0 or unit == "PiB":
                break
            size /= 1024.0
        return f"{size:.{decimal_places}f} {unit}"

    def build_notification(self, notification: dict, agent: str, arr_path: str):
        cover_art_url = None
        release_title = None
        file_size = None
        arr_notification = None

        if notification.get("release"):
            if notification["release"].get("releaseTitle"):
                release_title = notification["release"]["releaseTitle"]
                file_size = self.human_readable_size(notification["release"]["size"])

        if agent.startswith("Apprise") and notification["title"].startswith("Bazarr"):
            arr_notification = ArrNotificationModel(
                file_path=f"{notification['message']}",
                type=ArrSource.BAZARR,
                cover_art_url=cover_art_url,
                server_name="Bazarr",
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{notification['title']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
            )

        elif agent.startswith("Sonarr") and notification.get("series"):
            if notification["series"].get("images"):
                for image in notification["series"]["images"]:
                    if image["coverType"] == "poster":
                        cover_art_url = image.get("remoteUrl")

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                type=ArrSource.SONARR,
                cover_art_url=cover_art_url,
                server_name=notification["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"s{notification['episodes'][0]['seasonNumber']:02d}e{notification['episodes'][0]['episodeNumber']:02d} - {notification['series']['title']} - {notification['episodes'][0]['title']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
            )
        elif agent.startswith("Radarr") and notification.get("movie"):
            if notification["movie"].get("images"):
                for image in notification["movie"]["images"]:
                    if image["coverType"] == "poster":
                        cover_art_url = image.get("remoteUrl")

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                type=ArrSource.RADARR,
                cover_art_url=cover_art_url,
                server_name=notification["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{notification['movie']['title']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
            )

        elif agent.startswith("Lidarr") and notification.get("artist"):
            if notification.get("trackFile"):
                release_title = notification["trackFile"]["path"]
                file_size = self.human_readable_size(notification["trackFile"]["size"])

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                type=ArrSource.LIDARR,
                cover_art_url=cover_art_url,
                server_name=notification["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{notification['artist']['name']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
            )

        return arr_notification

    @cfa.post("/")
    async def webhook_handler(self, request: Request, notification: dict = Body(...)):
        logger.debug(f"Received webhook request: {notification}")
        agent = request.headers.get("user-agent")
        address = request.client
        event_type = notification.get("eventType") if notification.get("eventType") else "Unknown"
        logger.info(f"Rx Event {event_type} from {agent} at {request.scope['client']} ")
        arr_path = None
        ignored_event_types = ["Grab"]

        if event_type == "Unknown" and notification.get("path"):
            arr_path = await self.plex.scan_path(notification["path"])
        elif event_type not in ignored_event_types:
            if agent.startswith("Sonarr") and notification.get("series"):
                arr_path = notification["series"]["path"]

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

        try:
            arr_notification = self.build_notification(notification, agent, arr_path)
            if arr_notification:
                await self.plex_websocket.send_arr_notification(arr_notification)
        except Exception as e:
            logger.exception(e)

        return "Hook accepted"

    @cfa.put("/")
    async def put_webhook_handler(self, request: Request, notification: dict = Body(...)):
        return await self.webhook_handler(request, notification)
