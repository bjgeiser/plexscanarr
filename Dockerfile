FROM python:3.12-alpine3.21

#set the working directory to /bright/
WORKDIR /plexscanarr
COPY source/*.py VERSION requirements.txt ./web /plexscanarr/
COPY web /plexscanarr/web


RUN apk add  --no-cache build-base python3-dev linux-headers && \
    pip install -r requirements.txt  && \
    apk del build-base python3-dev linux-headers && \
    rm -rf /var/cache/apk/* && \
    rm -rf ~/.cache/pip

EXPOSE 5000
ENTRYPOINT ["python", "/plexscanarr/main.py"]
