FROM python:3.10.2-alpine3.15

#set the working directory to /bright/
WORKDIR /PlexScanarr
COPY *.py VERSION requirements.txt /PlexScanarr/

RUN apk add  --no-cache build-base python3-dev linux-headers && \
    pip install -r requirements.txt  && \
    apk del build-base python3-dev linux-headers && \
    rm -rf /var/cache/apk/* && \
    rm -rf ~/.cache/pip

EXPOSE 5000
ENTRYPOINT ["python", "/PlexScanarr/PlexScanarr.py"]
