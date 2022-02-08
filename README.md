# plexscanarr
Webhook server to start plex scans initiated by Sonarr, Radarr and Lidarr webhook posts.  This will limit the scan to only the media item being added and not the full library.  

Docker Hub: https://hub.docker.com/r/bjgeiser/plexscanarr

## Features
* Start targeted scans based on webhook posts/puts from Sonarr, Radarr and Lidar
* Simple web interface to manually manage scans running at `http://{listen-address}:{port}`
* Generic `POST` at `http://{listen-address}:{port}` of the JSON payload `{"path": "plex-path or download-path"}` will search for locations to scan within plex

## Setup
Configure a webhook connector to send events to plexscannar it will then apply any path transformations supplied and search the configured plex server for scans to initiate.
Create `config.yaml` as defined below.

### Sample `config.yaml`
```yaml
# required
plex-server: http://{plexserver}:32400

# optional
# some plex servers require tokens to access, such as those with multiple local users
# https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
plex-token: replace with token

# optional
# if your xxarr software uses different file paths for plex and downloads enter conversions here
path-converters:
  # UNC windows path to posix path
  - download-path: \\10.0.1.1\
    plex-path: /mnt/nas/
  # windows path to posix path  
  - download-path: C:\Videos\
    plex-path: /mnt/media/Videos
  # windows path to windows path  
  - download-path: C:\Videos\
    plex-path: T:\
  # posix path to posix path  
  - download-path: /mnt/downloads/TV
    plex-path: /mnt/media/TV

# optional
# server port, will default to 5000
#port: 5000

# optional
# listen address, will default to 0.0.0.0 (any address)
#listen-address: 127.0.0.1

# optional
# Allow webhook events to cancel a currently active scan in order to scan new media faster 
# default: false
#preempt-active-scan: true

# optional
# Turn on verbose logging
# default: false
#verbose: true
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
      - ./config.yaml:/plexscanarr/config.yaml
```