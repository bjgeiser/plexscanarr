import logging
import pathlib
import yaml

import click
import asyncio
import uvicorn

from path_converter import PathConverter
from arr_webhook import ArrWebhook
from plex_scan import PlexScan
from plex_websocket import PlexWebsocket
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from fastapi.responses import FileResponse


logging.basicConfig(format="[%(levelname)s %(name)s] %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)
leveldict = {
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "error": logging.ERROR,
    "warning": logging.WARNING,
    "critical": logging.CRITICAL,
}


async def main_async(
    log_level: str,
    config_path: pathlib.Path,
):
    logging.getLogger().setLevel(leveldict[log_level])

    if config_path and config_path.is_file():
        f = open(config_path, "r")
    else:
        f = open("config.yaml", "r")
    config = yaml.safe_load(f)

    verbose = config.get("verbose", False)
    if verbose:
        logger.info("Turning on verbose logging")
        logger.setLevel(logging.DEBUG)

    plex_websocket = PlexWebsocket(handle_rx=None)
    path_converter = PathConverter(config)
    plex_server = config.get("plex_server")
    plex_token = config.get("plex_token")
    preempt_active_scan = config.get("preempt_active_scan", False)
    plex = PlexScan(
        server=plex_server, token=plex_token, plex_websocket=plex_websocket, preempt_active_scan=preempt_active_scan
    )

    arr_lookup = config.get("arr_paths")

    arr_webhook = ArrWebhook(
        plex=plex, path_converter=path_converter, plex_websocket=plex_websocket, link_lookup=arr_lookup
    )

    app = FastAPI(favicon_url="/static/favicon.ico")
    app.include_router(arr_webhook.router, tags=["Webhook"])
    app.include_router(plex.router, tags=["Plex"], prefix="/plex")
    app.include_router(plex_websocket.router, tags=["Websocket"])

    static_path = pathlib.Path("web/build/client")
    app.mount("/assets", StaticFiles(directory=static_path / "assets"), name="assets")
    # app.mount("/static", StaticFiles(directory=static_path), name="static")
    app.mount("/img", StaticFiles(directory=static_path / "img"), name="static")

    @app.get("/favicon.ico")
    def favicon():
        return FileResponse(static_path / "favicon.ico")

    # Load of the static page for the default route
    @app.get("/{full_path:path}")
    def index(request: Request) -> FileResponse:
        return FileResponse(static_path / "index.html")
        # return templates.TemplateResponse("index.html", {"request": request})

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    webserver_port = config.get("port", 5000)
    host = config.get("listen_address", "0.0.0.0")
    config = uvicorn.Config(app=app, host=host, port=webserver_port, log_level=log_level.lower())
    server = uvicorn.Server(config=config)

    async with asyncio.TaskGroup() as task_group:
        task_group.create_task(server.serve())
        task_group.create_task(plex.run())


@click.command()
@click.option("--log_level", envvar="LOGGING_LEVEL", type=str, default="info", help="Logging Level")
@click.option("--config", envvar="CONFIG", type=click.Path(path_type=pathlib.Path), help="Config file path")
def main(
    log_level: str,
    config: pathlib.Path,
):
    logger.setLevel(leveldict[log_level])
    context = click.get_current_context()
    logger.error("Starting with supplied parameters:")
    for key, value in context.params.items():
        logger.info(f"   {key}: {value}")

    asyncio.run(
        main_async(
            log_level=log_level,
            config_path=config,
        ),
    )


if __name__ == "__main__":
    main()
