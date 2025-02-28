import logging
import datetime

import classy_fastapi as cfa

from path_converter import PathConverter
from plex_scan import PlexScan
from config import ArrPaths
from fastapi import Request, Body, HTTPException

from arr_notification import ArrNotificationModel, ArrSource
from plex_websocket import PlexWebsocket

logger = logging.getLogger(__name__)


class ArrWebhook(cfa.Routable):
    def __init__(
        self, plex: PlexScan, path_converter: PathConverter, plex_websocket: PlexWebsocket, link_lookup: list[ArrPaths]
    ):
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
                if entry.arr_instance_name == instance_name:
                    return entry.server_root.rstrip("/")
        return None

    def build_notification(
        self, arr_type: str, arr_payload: dict, agent: str, arr_path: str, scan_started: bool
    ) -> ArrNotificationModel:
        cover_art_url = None
        release_title = None
        file_size = None
        arr_notification = None

        try:
            server_root = self.get_arr_service_path(arr_payload["instanceName"])
            content_link = server_root
            release_title = arr_payload["release"]["releaseTitle"]
            file_size = self.human_readable_size(arr_payload["release"]["size"])
        except KeyError:
            pass

        if agent.startswith("Apprise") and arr_payload["title"].startswith("Bazarr"):
            arr_notification = ArrNotificationModel(
                file_path=f"{arr_payload['message']}",
                type=ArrSource.BAZARR,
                cover_art_url=cover_art_url,
                server_name="Bazarr",
                arr_type=arr_type,
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{arr_payload['title']}",
                original_json=arr_payload,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        elif agent.startswith("Sonarr") and arr_payload.get("series"):
            try:
                for image in arr_payload["series"]["images"]:
                    if image["coverType"] == "poster":
                        cover_art_url = image.get("remoteUrl")
                        break
            except KeyError:
                pass

            try:
                content_link = f"{server_root}/series/{arr_payload['series']['titleSlug']}"
            except Exception as e:
                logger.exception(e)
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.SONARR,
                cover_art_url=cover_art_url,
                server_name=arr_payload["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"s{arr_payload['episodes'][0]['seasonNumber']:02d}e{arr_payload['episodes'][0]['episodeNumber']:02d} - {arr_payload['series']['title']} - {arr_payload['episodes'][0]['title']}",
                original_json=arr_payload,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )
        elif agent.startswith("Radarr") and arr_payload.get("movie"):
            try:
                for image in arr_payload["movie"]["images"]:
                    if image["coverType"] == "poster":
                        cover_art_url = image.get("remoteUrl")
                        break
            except KeyError:
                pass

            try:
                content_link = f"{server_root}/movie/{arr_payload['movie']['tmdbId']}"
            except Exception as e:
                logger.exception(e)
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.RADARR,
                cover_art_url=cover_art_url,
                server_name=arr_payload["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{arr_payload['movie']['title']}",
                original_json=arr_payload,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        elif agent.startswith("Lidarr") and arr_payload.get("artist"):
            try:
                release_title = arr_payload["trackFile"]["path"]
                file_size = self.human_readable_size(arr_payload["trackFile"]["size"])
            except KeyError:
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.LIDARR,
                cover_art_url=cover_art_url,
                server_name=arr_payload["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{arr_payload['artist']['name']}",
                original_json=arr_payload,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        elif agent.startswith("Readarr") and arr_payload.get("author"):
            try:
                release_title = arr_payload["author"]["path"]
                author_name = arr_payload["author"]["name"]
                book_str = ""
                for books in arr_payload["books"]:
                    book_str += f"{', ' if len(book_str) else ''}{books['title']}"
                # file_size = self.human_readable_size(notification["trackFile"]["size"])
            except KeyError:
                pass

            arr_notification = ArrNotificationModel(
                file_path=arr_path,
                arr_type=arr_type,
                type=ArrSource.READARR,
                cover_art_url=cover_art_url,
                server_name=arr_payload["instanceName"],
                timestamp=datetime.datetime.now(datetime.UTC),
                pretty_name=f"{author_name} - {book_str}",
                original_json=arr_payload,
                release_title=release_title,
                file_size=file_size,
                service_link=server_root,
                content_link=content_link,
                scan_started=scan_started,
            )

        return arr_notification

    @cfa.post("/")
    async def webhook_handler(self, request: Request, arr_payload: dict = Body(...)):
        logger.debug(f"Received webhook request: {arr_payload}")
        agent = request.headers.get("user-agent")
        # address = request.client
        event_type = arr_payload.get("eventType", "Unknown")
        logger.info(f"Rx Event {event_type} from {agent} at {request.scope['client']} ")
        arr_path = None
        ignored_event_types = ["Grab"]
        scan_started = False

        if event_type == "Unknown" and arr_payload.get("path"):
            arr_path = await self.plex.scan_path(arr_payload["path"])
        elif event_type not in ignored_event_types:
            if agent.startswith("Sonarr") and arr_payload.get("series"):
                arr_path = arr_payload["series"]["path"]

            elif agent.startswith("Radarr") and arr_payload.get("movie"):
                arr_path = arr_payload["movie"]["folderPath"]

            elif agent.startswith("Lidarr") and arr_payload.get("artist"):
                arr_path = arr_payload["artist"]["path"]

            elif agent.startswith("Readarr") and arr_payload.get("author"):
                arr_path = arr_payload["author"]["path"]

        if arr_path:
            plex_path = self.path_converter.convert(arr_path)
            logger.info(f"Converted {arr_path} to {plex_path} and requesting scan")
            await self.plex.scan_path(plex_path)
            scan_started = True

        try:
            arr_notification = self.build_notification(
                arr_payload=arr_payload,
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
    async def put_webhook_handler(self, request: Request, arr_payload: dict = Body(...)):
        return await self.webhook_handler(request, arr_payload)

    @cfa.get("/services")
    async def get_arr_services(self):
        if self.link_lookup:
            return self.link_lookup
        raise HTTPException(status_code=404, detail="Item not found")
