import logging
import asyncio
from plexapi.server import PlexServer

logging.basicConfig(format="[%(levelname)s %(name)s] %(message)s", level=logging.DEBUG)
logger = logging.getLogger(__name__)


class PlexScan:
    def __init__(self, server: str, token: str, preempt_active_scan: bool = False) -> None:
        self.preempt_active_scan = preempt_active_scan
        self.plex = PlexServer(baseurl=server, token=token)
        self.version = self.plex.version
        self.friendly_name = self.plex.friendlyName
        self.platform = self.plex.platform
        logger.info(f"Connected to {self.friendly_name} running: {self.platform} version: {self.version}")
        self.work_queue = asyncio.Queue()


    async def get_locations(self) -> list[str]:
        locations = []
        sections = self.plex.library.sections()
        for section in sections:
            for location in section.locations:
                logger.info(f"{location}")
                locations.append(location)
        return locations


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

