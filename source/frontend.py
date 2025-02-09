import logging
from fastapi.responses import FileResponse

import classy_fastapi as cfa

logger = logging.getLogger(__name__)


class FrontEnd(cfa.Routable):
    def __init__(self) -> None:
        super().__init__()

    @cfa.get("/")
    async def get_home(self):
        return FileResponse("html/dist/index.html")
