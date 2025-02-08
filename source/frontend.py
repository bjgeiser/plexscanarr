import logging
import asyncio
from fastapi.responses import FileResponse

import classy_fastapi as cfa

logging.basicConfig(format="[%(levelname)s %(name)s] %(message)s", level=logging.DEBUG)
logger = logging.getLogger(__name__)


class FrontEnd(cfa.Routable):
    def __init__(self) -> None:
        super().__init__()

    @cfa.get("/")
    async def get_home(self):
        return FileResponse("html/build/index.html")