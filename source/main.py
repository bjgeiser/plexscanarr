import logging
import pathlib
import yaml

import click
import asyncio
import uvicorn
from pydantic.types import PathType

from plex_scan import PlexScan
from fastapi import FastAPI


logging.basicConfig(format="[%(levelname)s %(name)s] %(message)s", level=logging.DEBUG)
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
    webserver_port: int,
    config_path: pathlib.Path,
):
    logging.getLogger().setLevel(leveldict[log_level])

    if config_path and config_path.is_file():
        f = open(config_path, 'r')
    else:
        f = open('config.yaml', 'r')
    config = yaml.safe_load(f)


    app = FastAPI()

    plex_server = config.get("plex-server")
    plex_token = config.get("plex-token")
    plex = PlexScan(server=plex_server, token=plex_token)

    config = uvicorn.Config(app=app, host="0.0.0.0", port=webserver_port, log_level=log_level.lower())
    server = uvicorn.Server(config=config)

    async with asyncio.TaskGroup() as task_group:
        task_group.create_task(server.serve())
        task_group.create_task(plex.run())


@click.command()
@click.option("--log_level", envvar="LOGGING_LEVEL", type=str, default="info", help="Logging Level")
@click.option("--webserver_port", envvar="WEBSERVER_PORT", type=int, default=5000, help="Webserver Port")
@click.option("--config", envvar="CONFIG",
              type=click.Path(path_type=pathlib.Path),
              help="Config file path")
def main(
    log_level: str,
    webserver_port: int,
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
            webserver_port=webserver_port,
            config_path=config,
        ),
    )


if __name__ == "__main__":
    main()