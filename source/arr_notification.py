from datetime import datetime
from enum import StrEnum, auto

from pydantic import BaseModel


class ArrSource(StrEnum):
    PLEXSCANARR = auto()
    RADARR = auto()
    SONARR = auto()
    LIDARR = auto()
    READARR = auto()
    BAZARR = auto()
    PLEX = auto()


class ArrNotificationModel(BaseModel):
    type: ArrSource
    arr_type: str
    timestamp: datetime
    cover_art_url: str | None = None
    pretty_name: str
    server_name: str
    file_path: str | None = None
    original_json: dict
    scan_started: bool = False
    release_title: str | None = None
    file_size: str | None = None
    service_link: str | None = None
    content_link: str | None = None
