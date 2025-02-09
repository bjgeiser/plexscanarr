from datetime import datetime
from enum import StrEnum, auto

from pydantic import BaseModel


class ArrSource(StrEnum):
    RADARR = auto()
    SONARR = auto()
    LIDARR = auto()
    READARR = auto()


class ArrNotificationModel(BaseModel):
    type: ArrSource
    timestamp: datetime
    cover_art_url: str
    pretty_name: str
    server_name: str
    file_path: str
    original_json: dict
