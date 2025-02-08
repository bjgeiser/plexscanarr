import logging
import os

logger = logging.getLogger(__name__)

class PathConverter:
    def __init__(self, config):
        self.config = config

    def normalizeFolders(self, path):
        if "\\" in path:
            if not path.endswith("\\"):
                path = path + "\\"
        else:
            if not path.endswith("/"):
                path = path + "/"
        return path

    def normalizeSlashes(self, path, plex_path):
        if "\\" in plex_path:
            return path.replace("/", "\\")
        else:
            return path.replace("\\", "/")

    def convert(self, notification_path):
        if self.config.get('path-converters'):
            for convertPath in self.config['path-converters']:
                download_path = self.normalizeFolders(convertPath['download-path'])
                plex_path = self.normalizeFolders(convertPath['plex-path'])

                if notification_path.startswith(download_path):
                    remaining_path = notification_path.replace(download_path, "")
                    remaining_path = self.normalizeSlashes(remaining_path, plex_path)
                    transformed_path = os.path.join(plex_path, remaining_path)
                    return transformed_path

        return notification_path