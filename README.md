# plexscanarr

Webhook server to start plex scans initiated by Sonarr, Radarr and Lidarr webhook posts. This will limit the scan to only the media item being added and not the full library.

Docker Hub: https://hub.docker.com/r/bjgeiser/plexscanarr <br> GitHub: https://github.com/bjgeiser/plexscanarr

## Features

- Start targeted scans based on webhook posts/puts from Sonarr, Radarr and Lidar
- Simple web interface to manually manage scans running at `http://{listen-address}:{port}`
- Generic `POST` at `http://{listen-address}:{port}` of the JSON payload `{"path": "plex-path or download-path"}` will search for locations to scan within plex

## Setup

Configure a webhook connector to send events to plexscannar it will then apply any path transformations supplied and search the configured plex server for scans to initiate. Create `config.yaml` as defined below.

### Sample `config.yaml`

```yaml
# required
plex_server: http://{plexserver}:32400

# optional
# some plex servers require tokens to access, such as those with multiple local users
# https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
plex_token: replace with token

# optional
# if your xxarr software uses different file paths for plex and downloads enter conversions here
path_converters:
  # UNC windows path to posix path
  - download_path: \\10.0.1.1\
    plex_path: /mnt/nas/
  # windows path to posix path
  - download_path: C:\Videos\
    plex_path: /mnt/media/Videos
  # windows path to windows path
  - download_path: C:\Videos\
    plex_path: T:\
  # posix path to posix path
  - download_path: /mnt/downloads/TV
    plex_path: /mnt/media/TV

# optional
# note: instance names are settable the general settings for arr apps if you allow for advanced options
arr_paths:
  - arr_instance_name: Sonarr
    server_root: http://sonarr.domain.com
  - arr_instance_name: Sonarr 4K
    server_root: http://192.162.1.26:8000/
  - arr_instance_name: Radarr
    server_root: http://radarr.domain.net:1000
  - arr_instance_name: Lidarr
    server_root: http://lidarr.domain.com
  - arr_instance_name: Readarr
    server_root: http://readarr.domain.com

# optional
# server port, will default to 5000
port: 5000

# optional
# listen address, will default to 0.0.0.0 (any address)
listen_address: 127.0.0.1

# optional
# Allow webhook events to cancel a currently active scan in order to scan new media faster
# default: false
preempt_active_scan: true

# optional
# Turn on verbose logging
# default: false
verbose: true
```

### Sample `docker-compose.yaml`

```yaml
version: "3"

services:
  plexscannar:
    image: bjgeiser/plexscanarr:latest
    restart: always
    ports:
      - 5000:5000
    volumes:
      - ./config.yaml:/plexscanarr/config.yaml
```
