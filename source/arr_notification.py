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


class ArrNotificationModel(BaseModel):
    type: ArrSource
    timestamp: datetime
    cover_art_url: str | None = None
    pretty_name: str
    server_name: str
    file_path: str
    original_json: dict
    release_title: str | None = None
    file_size: str | None = None
