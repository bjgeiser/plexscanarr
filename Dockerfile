FROM python:3.11.0a5-alpine3.15

#set the working directory to /bright/
WORKDIR /PlexScanarr
COPY *.py requirements.txt /PlexScanarr/

RUN pip install -r requirements.txt  && \
    rm -rf /var/cache/apk/* && \
    rm -rf ~/.cache/pip

EXPOSE 5000
ENTRYPOINT ["python", "/PlexScanarr/PlexScanarr.py", "-c"]