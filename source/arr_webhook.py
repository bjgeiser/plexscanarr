import logging
import datetime

import classy_fastapi as cfa

from path_converter import PathConverter
from plex_scan import PlexScan
from fastapi import Request, Body, HTTPException

from source.arr_notification import ArrNotificationModel, ArrSource
from source.plex_websocket import PlexWebsocket

logger = logging.getLogger(__name__)


class ArrWebhook(cfa.Routable):
    def __init__(self, plex: PlexScan, path_converter: PathConverter, plex_websocket: PlexWebsocket, link_lookup: dict):
        super().__init__()
        self.plex = plex
        self.path_converter = path_converter
        self.plex_websocket = plex_websocket
        self.link_lookup = link_lookup

    @staticmethod
    def human_readable_size(size_in_bytes: int, decimal_places: int = 2) -> str:
        for unit in ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]:
            if size_in_bytes < 1024.0 or unit == "PiB":
                break
            size_in_bytes /= 1024.0
        return f"{size_in_bytes:.{decimal_places}f} {unit}"

    def get_arr_service_path(self, instance_name: str) -> str | None:
        if self.link_lookup:
            for entry in self.link_lookup:
                if entry["instance-name"] == instance_name:
                    return entry["server-root"].rstrip("/")
        return None

    def build_notification(self, arr_type: str, notification: dict, agent: str, arr_path: str, scan_started: bool):
        cover_art_url = None
        release_title = None
        file_size = None
        arr_notification = None

        server_root = self.get_arr_service_path(notification["instanceName"])
        content_link = server_root

        try:
            release_title = notification["release"]["releaseTitle"]
            file_size = self.human_readable_size(notification["release"]["size"])
        except KeyError:
            pass

        if agent.startswith("Apprise") and notification["title"].startswith("Bazarr"):
            arr_notification = ArrNotificationModel(
                file_path=f"{notification['message']}",
                type=ArrSource.BAZARR,
                cover_art_url=cover_art_url,
                server_name="Bazarr",
                arr_type=arr_type,
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{notification['title']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        elif agent.startswith("Sonarr") and notification.get("series"):
            try:
                for image in notification["series"]["images"]:
                    if image["coverType"] == "poster":
                        cover_art_url = image.get("remoteUrl")
                        break
            except KeyError:
                pass

            try:
                content_link = f"{server_root}/series/{notification['series']['titleSlug']}"
            except Exception as e:
                logger.exception(e)
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.SONARR,
                cover_art_url=cover_art_url,
                server_name=notification["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"s{notification['episodes'][0]['seasonNumber']:02d}e{notification['episodes'][0]['episodeNumber']:02d} - {notification['series']['title']} - {notification['episodes'][0]['title']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )
        elif agent.startswith("Radarr") and notification.get("movie"):
            try:
                for image in notification["movie"]["images"]:
                    if image["coverType"] == "poster":
                        cover_art_url = image.get("remoteUrl")
                        break
            except KeyError:
                pass

            try:
                content_link = f"{server_root}/movie/{notification['movie']['tmdbId']}"
            except Exception as e:
                logger.exception(e)
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.RADARR,
                cover_art_url=cover_art_url,
                server_name=notification["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{notification['movie']['title']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        elif agent.startswith("Lidarr") and notification.get("artist"):
            try:
                release_title = notification["trackFile"]["path"]
                file_size = self.human_readable_size(notification["trackFile"]["size"])
            except KeyError:
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.LIDARR,
                cover_art_url=cover_art_url,
                server_name=notification["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{notification['artist']['name']}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        elif agent.startswith("Readarr") and notification.get("author"):
            try:
                release_title = notification["author"]["path"]
                author_name = notification["author"]["name"]
                book_str = ""
                for books in notification["books"]:
                    book_str += f"{', ' if len(book_str) else ''}{books['title']}"
                # file_size = self.human_readable_size(notification["trackFile"]["size"])
            except KeyError:
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.READARR,
                cover_art_url=cover_art_url,
                server_name=notification["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{author_name} - {book_str}",
                original_json=notification,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        return arr_notification

    @cfa.post("/")
    async def webhook_handler(self, request: Request, notification: dict = Body(...)):
        logger.debug(f"Received webhook request: {notification}")
        agent = request.headers.get("user-agent")
        # address = request.client
        event_type = notification.get("eventType", "Unknown")
        logger.info(f"Rx Event {event_type} from {agent} at {request.scope['client']} ")
        arr_path = None
        ignored_event_types = ["Grab"]
        scan_started = False

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
            scan_started = True

        try:
            arr_notification = self.build_notification(
                notification=notification,
                agent=agent,
                arr_path=arr_path,
                arr_type=event_type,
                scan_started=scan_started,
            )
            await self.plex_websocket.send_arr_notification(arr_notification)

        except Exception as e:
            logger.exception(e)

        return "Hook accepted"

    @cfa.put("/")
    async def put_webhook_handler(self, request: Request, notification: dict = Body(...)):
        return await self.webhook_handler(request, notification)

    @cfa.get("/services")
    async def get_arr_services(self):
        if self.link_lookup:
            return self.link_lookup
        raise HTTPException(status_code=404, detail="Item not found")
