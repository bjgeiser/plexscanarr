import pathlib
import logging
import yaml
from pydantic import BaseModel
import classy_fastapi as cfa

logger = logging.getLogger(__name__)


class PathConverters(BaseModel):
    download_path: str
    plex_path: str


class ArrPaths(BaseModel):
    arr_instance_name: str
    server_root: str


class ConfigModel(BaseModel):
    plex_server: str
    plex_token: str
    path_converters: list[PathConverters] = []
    port: int = 5002
    listen_address: str = "127.0.0.1"
    preempt_active_scan: bool = True
    arr_paths: list[ArrPaths] = []
    verbose: bool = False
    cache_plex_notifications: bool = False
    calculate_library_sizes: bool = False
    calculate_item_sizes: bool = False


class Config(cfa.Routable):
    def __init__(self, config_path: pathlib.Path):
        super().__init__()
        self.config_path = config_path

        if self.config_path and config_path.is_file():
            f = open(config_path, "r")
        elif pathlib.Path("config.yaml").is_file():
            self.config_path = pathlib.Path("config.yaml")
            f = open("config.yaml", "r")
        else:
            new_config = ConfigModel(
                plex_server="{enter plex server address here}", plex_token="{enter plex token here}"
            )
            self.config_path = pathlib.Path("config.yaml")
            with open("config.yaml", "w") as f:
                yaml.safe_dump(new_config.model_dump(), f)
            logging.error("New config.yaml created replace plex_server and plex_token and restart app")
            exit(1)

        _config = yaml.safe_load(f)
        self.settings = ConfigModel.model_validate(_config)

    def save(self):
        with open(self.config_path, "w") as f:
            yaml.safe_dump(self.settings.model_dump(), f)

    @cfa.get("/")
    def get_settings(self):
        settings = self.settings.model_copy()
        settings.plex_token = "secret"
        return settings.model_dump()

    @cfa.post("/enable_library_sizes")
    def enable_library_sizes(self, enable: bool):
        self.settings.calculate_library_sizes = enable
        self.save()

    @cfa.post("/enable_item_sizes")
    def enable_item_sizes(self, enable: bool):
        self.settings.calculate_item_sizes = enable
        self.save()

    @cfa.post("/enable_plex_notification_cache")
    def enable_plex_notification_cache(self, enable: bool):
        self.settings.cache_plex_notifications = enable
        self.save()
