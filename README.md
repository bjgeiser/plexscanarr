# plexscanarr
Webhook server to start plex scans initiated by Sonarr, Radarr and Lidarr webhook posts.  This will limit the scan to only the media item being added and not the full library.

### Setup
Configure a webhook connector to send events to plexscannar it then apply any path transformations supplied and search the configured plex server for scans to initiate.

### Sample `config.yaml`
```yaml
# required
plex-server: http://{plexserver}}:32400

# optional
# some plex servers require tokens to access, such as those with multiple local users
# https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
plex-token: replace with token

# optional
# if your xxarr software uses different file paths for plex and downloads enter conversions here
path-converters:
  - download-path: \\10.0.1.1\
    plex-path: /mnt/nas/
  - download-path: C:\Videos\
    plex-path: /mnt/media/Videos
  - download-path: /mnt/downloads/TV
    plex-path: /mnt/media/TV

# optional
# server port, will default to 5000
#port: 5000

# optional
# listen address, will default to 0.0.0.0 (any address)
#listen-address: 127.0.0.1
```

### Sample `docker-compose.yaml`
```yaml
version: '3'

services:
  plexscannar:
    image: bjgeiser/plexscanarr:latest
    restart: always
    ports:
      - 5000:5000
    volumes:
      - ./config.yaml:/PlexScanarr/config.yaml

```