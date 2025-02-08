import logging
import asyncio
import pathlib
import sys
from dataclasses import dataclass

#from plex_api_client import PlexAPI

from plexapi.server import PlexServer

logging.basicConfig(format="[%(levelname)s %(name)s] %(message)s", level=logging.DEBUG)
logger = logging.getLogger(__name__)




class PlexScan:
    def __init__(self, server: str, token: str) -> None:
        #self.plex = PlexAPI(server_url=server, access_token=token)
        #self.version = "Unknown"
        #self.friendly_name = "Unknown"
        #self.platform = "Unknown"
        self.preempt_active_scan = False
        self.plex = PlexServer(baseurl=server, token=token)
        self.version = self.plex.version
        self.friendly_name = "self.plex.friendlyName"
        self.platform = self.plex.platform
        logger.info(f"Connected to {self.friendly_name} running: {self.platform} version: {self.version}")
        self.work_queue = asyncio.Queue()


    #async def connect(self) -> bool:
    #    res = await self.plex.server.get_server_capabilities_async()
    #    if res.status_code == 200:
    #        capabilities = res.object
    #        logging.debug(capabilities)
    #        self.version = capabilities.media_container.version
    #        self.friendly_name = capabilities.media_container.friendly_name
    #        self.platform = capabilities.media_container.platform
    #
    #        return True
    #    return False

    async def scan_path(self, path) -> bool:
        await self.work_queue.put(path)

    def _scan_path(self, path: str) -> bool:
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


    #    scanned = False
#
    #    res = await self.plex.library.get_all_libraries_async()
    #    if res.status_code == 200:
    #        libraries = res.object.media_container.model_dump()
#
    #        for directory in libraries["directory"]:
    #            for loc in directory["location"]:
    #                lib_path = loc["path"]
    #                key = loc["key"]
    #                if path.startswith(lib_path):
    #                    logging.info(f"Found library path: {lib_path}")
    #                    self.plex.library.get_refresh_library_metadata(section_key=key)
#
#
    #                if
    #        return True
#
    #    return False
      # sections = plex.library.sections()

      # plexPath = transformToPlexPath(notificationPath)
      # if plexPath != notificationPath:
      #     logger.info(f"Path transformed from: {notificationPath} to {plexPath}")

      # for section in sections:
      #     for location in section.locations:
      #         if plexPath.startswith(location):
      #             if config.get("preempt-active-scan"):
      #                 cancel = False
      #                 for s in sections:
      #                     if s.refreshing:
      #                         cancel = True
      #                         logger.info(f"Preempt scan in {s.title}, canceling")
      #                 if cancel:
      #                     logger.info(f"Canceling all active scans in order to handle requested scan")
      #                     plex.library.cancelUpdate()

      #             logger.info(f"Requesting Scan {plexPath} in {section.title}")
      #             section.update(plexPath)
      #             scanned = True

      # if not scanned:
      #     logger.info(f"No matches found for {notificationPath}")
      # return scanned


    async def run(self) -> None:
        while True:
            await self.scan_path("/cifs/SERVER/Videos/Kids Movies")
            await asyncio.sleep(30)

