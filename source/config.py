import pathlib
import logging
import yaml
from pydantic import BaseModel, ValidationError
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
    include_item_locations: bool = False


class Config(cfa.Routable):
    CONFIG_FILE = "config.yaml"

    def __init__(self, config_path: pathlib.Path):
        super().__init__()
        self.config_path = config_path

        if self.config_path.is_file():
            config_file = self.config_path
        else:
            config_file = self.config_path / self.CONFIG_FILE

        if not config_file.exists():
            config_file.mkdir(parents=True, exist_ok=True)
            new_config = ConfigModel(
                plex_server="{enter plex server address here}", plex_token="{enter plex token here}"
            )
            config_file = self.config_path / self.CONFIG_FILE
            with open(config_file, "w") as f:
                yaml.safe_dump(new_config.model_dump(), f)
            logging.error("New config.yaml created replace plex_server and plex_token and restart app")
            exit(1)

        with open(config_file, "r") as f:
            _config = yaml.safe_load(f)
        try:
            self.settings = ConfigModel.model_validate(_config)
        except ValidationError as e:
            logger.error(f"Error loading config: {e}")
            exit(1)

    def save(self):
        with open(self.config_path, "w") as f:
            yaml.safe_dump(self.settings.model_dump(), f)
            logger.info(f"New config saved to {self.config_path}")

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

    @cfa.post("/enable_include_item_locations")
    def enable_include_item_locations(self, enable: bool):
        self.settings.include_item_locations = enable
        self.save()
