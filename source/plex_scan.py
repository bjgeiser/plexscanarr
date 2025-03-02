import datetime
import logging
import asyncio
import plexapi
import plexapi.exceptions
from plexapi.audio import Artist
from plexapi.server import PlexServer
import classy_fastapi as cfa
from pathlib import Path
from fastapi import HTTPException
from plexapi.video import Movie, Show, Video
from pydantic import BaseModel

from config import Config

from arr_notification import ArrNotificationModel, ArrSource
from plex_websocket import PlexWebsocket


class PlexLibraryDTO(BaseModel):
    name: str
    path: str
    key: int
    locations: list[str]
    type: str
    scan_active: bool
    server_link: str
    size: float | None = None


class PlexLibraryDetailsDTO(BaseModel):
    title: str
    year: int
    key: int
    type: str
    locations: list[str] | None = None
    size: float | None = None


logger = logging.getLogger(__name__)

type_lut = {"artist": "Music", "show": "TV Shows", "series": "TV Shows", "movie": "Movies"}
BYTES_PER_GB = 2**32


class PlexScan(cfa.Routable):
    def __init__(self, server: str, token: str, plex_websocket: PlexWebsocket, config: Config) -> None:
        super().__init__()
        self.config = config
        self.preempt_active_scan = config.settings.preempt_active_scan
        self.plex = PlexServer(baseurl=server, token=token)
        self.plex_websocket = plex_websocket
        self.version = self.plex.version
        self.friendly_name = self.plex.friendlyName
        self.platform = self.plex.platform
        self.machine_id = self.plex.machineIdentifier
        logger.info(f"Connected to {self.friendly_name} running: {self.platform} version: {self.version}")
        self.work_queue = asyncio.Queue()
        self.listener = self.plex.startAlertListener(
            callback=self.plex_event_callback, callbackError=self.plex_error_callback
        )
        self.library_sizes = {}

    def plex_event_callback(self, event):
        # logger.debug(f"Received {event}")

        if event["type"] == "status":
            logger.debug(f"Received Status {event}")
            if event.get("StatusNotification"):
                notification = ArrNotificationModel(
                    file_path="",
                    arr_type="",
                    type=ArrSource.PLEX,
                    server_name="Plex",
                    timestamp=datetime.datetime.now(datetime.UTC),
                    pretty_name="",
                    scan_started=False,
                    service_link=f"https://app.plex.tv/desktop/#!/media/{self.machine_id}/com.plexapp.plugins.library?key=%2Fhubs&pageType=hub",
                    content_link=f"https://app.plex.tv/desktop/#!/media/{self.machine_id}/com.plexapp.plugins.library?key=%2Fhubs&pageType=hub",
                    original_json=event,
                )
                status_notification = event.get("StatusNotification")
                for notify in status_notification:
                    title = notify.get("title")
                    name = notify.get("notificationName")
                    logger.info(f"Plex status notification: {title} {name}")
                    notification.arr_type = name
                    notification.pretty_name = title
                    if title.startswith("Scanning"):
                        libary = title.split('"')[1]
                        logger.info(f"Scanning {libary}")
                        notification.file_path = libary
                        notification.scan_started = True
                        asyncio.run(self.plex_websocket.send_plex_notification(notification))

                    elif (
                        title.startswith("Library scan complete")
                        or title.startswith("Library scan canceled")
                        or title.startswith("Library scan interrupted")
                    ):
                        logger.info(f"Scanning Complete {title}")
                        notification.arr_type = "Scanning Complete {title}"
                        notification.scan_started = False
                        asyncio.run(self.plex_websocket.send_plex_notification(notification))

    def plex_error_callback(self, error):
        logger.info(f"Received error: {error}")

    @staticmethod
    def get_dir_path(path: str) -> str:
        path_obj = Path(path)
        ext = path_obj.suffix
        if ext:
            dir_path = str(path_obj.parent)
        else:
            dir_path = str(path_obj)
        return dir_path

    @cfa.get("/info")
    async def info(self):
        return {
            "server": self.friendly_name,
            "version": self.version,
            "platform": self.platform,
            "scan_active": self.scan_active(),
            "server_link": f"https://app.plex.tv/desktop/#!/media/{self.machine_id}/com.plexapp.plugins.library?key=%2Fhubs&pageType=hub",
        }

    @cfa.get("/libraries")
    async def get_libraries(self, key: int | None = None) -> list[str]:
        return_list = []
        if key:
            section = self.plex.library.sectionByID(key)
            if not section:
                raise HTTPException(status_code=404, detail=f"Library {key} not found")
            return_list = [
                {
                    "name": section.title,
                    "path": section.title.replace(" ", ""),
                    "key": section.key,
                    "locations": section.locations,
                    "type": section.type,
                    "scan_active": section.refreshing,
                    "server_link": f"https://app.plex.tv/desktop/#!/media/{self.machine_id}/com.plexapp.plugins.library?source={section.key}",
                }
            ]
            if self.config.settings.calculate_library_sizes:
                return_list[-1]["size"] = section.size
            return return_list
        else:
            sections = self.plex.library.sections()

            for section in sections:
                _type = section.type

                if "none" in section.agent:
                    _type = section.CONTENT_TYPE
                else:
                    _type = section.agent.split(".")[-1]

                if _type in type_lut:
                    _type = type_lut[_type]

                _type = _type[0].upper() + _type[1:]

                section_json = PlexLibraryDTO(
                    name=section.title,
                    path=section.title.replace(" ", ""),
                    key=section.key,
                    locations=[],
                    type=_type,
                    scan_active=section.refreshing,
                    server_link=f"https://app.plex.tv/desktop/#!/media/{self.machine_id}/com.plexapp.plugins.library?source={section.key}",
                )
                if self.config.settings.calculate_library_sizes:
                    get_size = False
                    if section.key not in self.library_sizes.keys():
                        get_size = True
                    elif datetime.datetime.now(datetime.timezone.utc) - self.library_sizes[section.key][
                        "timestamp"
                    ] > datetime.timedelta(hours=5):
                        get_size = True

                    if get_size:
                        logger.info(f"caching library size  key: {section.key} title: {section.title}")
                        self.library_sizes[section.key] = {}
                        self.library_sizes[section.key]["size"] = section.totalStorage / (1024 * 1024 * 1024)
                        self.library_sizes[section.key]["timestamp"] = datetime.datetime.now(datetime.timezone.utc)
                    try:
                        section_json.size = self.library_sizes[section.key]["size"]
                    except Exception as e:
                        logger.exception(e)
                        section_json.size = -1

                for location in section.locations:
                    section_json.locations.append(location)
                return_list.append(section_json)
        return return_list

    @cfa.post("/libraries/scan")
    async def start_full_scan_handler(self):
        self.plex.library.update()

    @cfa.delete("/libraries/scan")
    async def stop_full_scan_handler(self):
        self.plex.library.cancelUpdate()

    @cfa.get("/libraries/{key}/details")
    async def get_libraries_details(self, key: int) -> list[dict[str, str]]:
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(f"{self.plex.url}/library/sections/{key}/all") as response:
        #         data = await response.json()
        return_list: list[PlexLibraryDetailsDTO] = []
        try:
            section = self.plex.library.sectionByID(key)
            # if section:
            #     # alphabet_list = list("0123456789" + string.ascii_lowercase)
            #     # for letter in alphabet_list:
            items = section.search()
            for item in items:
                return_list.append(
                    PlexLibraryDetailsDTO(
                        title=item.title,
                        year=item.year if hasattr(item, "year") and item.year else -1,
                        key=item.ratingKey,  # Use this instead of key so we can scan directly
                        type=item.type,
                        locations=item.locations,
                        size=0,
                    )
                )
                if self.config.settings.calculate_item_sizes:
                    size = 0

                    if type(item) is Show:
                        logger.info(f"Collecting sizes for title: {item.title}")
                        episodes = item.episodes()

                        for episode in episodes:
                            for media in episode.media:
                                for part in media.parts:
                                    size += part.size

                    elif type(item) is Movie or type(item) is Video:
                        logger.info(f"Collecting sizes for title: {item.title}")
                        for media in item.media:
                            for part in media.parts:
                                size += part.size

                    elif type(item) is Artist:
                        logger.info(f"Collecting music sizes for title: {item.title}")
                        albums = item.albums()
                        for album in albums:
                            tracks = album.tracks()
                            for track in tracks:
                                for media in track.media:
                                    for part in media.parts:
                                        size += part.size
                    else:
                        logger.error(f"Unknown type: {type(item)}")
                        size = 0
                    return_list[-1].size = size / BYTES_PER_GB

        except plexapi.exceptions.NotFound:
            logger.error(f"Failed to find section with key {key}")
            raise HTTPException(status_code=404, detail=f"Library {key} not found")
        return return_list

    @cfa.post("/libraries/{key}/scan")
    async def start_scan_handler(self, key: int):
        section = self.plex.library.sectionByID(key)
        if section:
            section.update()
        else:
            logger.error(f"Failed to find section with key {key}")
            raise cfa.HTTPException(status_code=404, detail=f"Library {key} not found")

    @cfa.delete("/libraries/{key}/scan")
    async def stop_scan_handler(self, key: int):
        section = self.plex.library.sectionByID(key)
        if section:
            section.cancelUpdate()
        else:
            logger.error(f"Failed to find section with key {key}")
            raise cfa.HTTPException(status_code=404, detail=f"Library {key} not found")

    @cfa.post("/item/{key}/scan")
    async def item_scan_handler(self, key: int):
        item = self.plex.fetchItem(key)
        section = self.plex.library.sectionByID(item.librarySectionID)

        if self.preempt_active_scan:
            cancel = False
            for section in self.plex.library.sections():
                if section.refreshing:
                    cancel = True
                    logger.info(f"Preempt scan in {section.title}, canceling")
            if cancel:
                logger.info("Canceling all active scans in order to handle requested scan")
                self.plex.library.cancelUpdate()

        for location in item.locations:
            location = self.get_dir_path(location)
            logger.info(
                f"Requesting Manual Scan of Title: {item.title} at {location} in Section: {item.librarySectionTitle}"
            )
            section.update(location)

    def scan_active(self) -> bool:
        sections = self.plex.library.sections()
        scanning = False
        for section in sections:
            if section.refreshing:
                scanning = True
        return scanning

    async def scan_path(self, path) -> bool:
        await self.work_queue.put(path)

    async def _scan_path(self, path: str) -> bool:
        scanned = False
        found_match = False
        sections = self.plex.library.sections()
        for section in sections:
            for location in section.locations:
                if path.startswith(location):
                    found_match = True
                    if self.preempt_active_scan:
                        cancel = False
                        for s in sections:
                            if s.refreshing:
                                cancel = True
                                logger.info(f"Preempt scan in {s.title}, canceling")
                        if cancel:
                            logger.info("Canceling all active scans in order to handle requested scan")
                            self.plex.library.cancelUpdate()

                    logger.info(f"Requesting Scan {path} in {section.title}")
                    section.update(path)
                    scanned = True
        if not found_match:
            logger.error(f"Path {path} not found")
            scanned = True

        return scanned

    async def run(self) -> None:
        while True:
            await asyncio.sleep(0)
            path = await self.work_queue.get()
            if path is not None:
                if not await self._scan_path(path):
                    logger.error(f"Failed to scan {path}, adding back on queue")
                    await self.work_queue.put(path)
