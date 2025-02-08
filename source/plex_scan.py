import logging
import asyncio
from plexapi.server import PlexServer
import classy_fastapi as cfa


logging.basicConfig(format="[%(levelname)s %(name)s] %(message)s", level=logging.DEBUG)
logger = logging.getLogger(__name__)

type_lut = { "artist" : "Music" , "show" :  "TV Shows", "series" :  "TV Shows", "movie" : "Movies" }

class PlexScan(cfa.Routable):
    def __init__(self, server: str, token: str, preempt_active_scan: bool = False) -> None:
        super().__init__()
        self.preempt_active_scan = preempt_active_scan
        self.plex = PlexServer(baseurl=server, token=token)
        self.version = self.plex.version
        self.friendly_name = self.plex.friendlyName
        self.platform = self.plex.platform
        logger.info(f"Connected to {self.friendly_name} running: {self.platform} version: {self.version}")
        self.work_queue = asyncio.Queue()

    @cfa.get("/info")
    async def info(self):
        return {"server": self.friendly_name, "version": self.version, "platform": self.platform, "scan_active": self.scan_active()}

    @cfa.get("/libraries")
    async def get_libraries(self) -> list[str]:
        return_list = []
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

            section_json = {"name": section.title, "key": section.key, "locations": [], "type": _type, "scan_active": section.refreshing}
            for location in section.locations:
                section_json["locations"].append(location)
            return_list.append(section_json)

        return return_list

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
        sections = self.plex.library.sections()
        for section in sections:
            for location in section.locations:
                if path.startswith(location):
                    if self.preempt_active_scan:
                        cancel = False
                        for s in sections:
                            if s.refreshing:
                                cancel = True
                                logger.info(f"Preempt scan in {s.title}, canceling")
                        if cancel:
                            logger.info(f"Canceling all active scans in order to handle requested scan")
                            self.plex.library.cancelUpdate()

                    logger.info(f"Requesting Scan {path} in {section.title}")
                    section.update(path)
                    scanned = True
        return scanned


    async def run(self) -> None:

        while True:
            path = await self.work_queue.get()
            if path is not None:
                if not await self._scan_path(path):
                    logger.error(f"Failed to scan {path}, adding back on queue")
                    await self.work_queue.put(path)

