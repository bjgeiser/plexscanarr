FROM --platform=linux/amd64 ubuntu:22.04 as react_builder

WORKDIR /html_build
COPY /html/. .

RUN apt update && apt install -y dos2unix wget xz-utils

RUN ./build-page.sh

FROM python:3.13

#set the working directory to /bright/
WORKDIR /plexscanarr
COPY VERSION pyproject.toml /plexscanarr/
#COPY web /plexscanarr/web
COPY --from=react_builder /html_build/public/index.html /plexscanarr/html/public/index.html
COPY source /plexscanarr/source
COPY web /plexscanarr/web

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"
RUN uv pip install --system -e .


EXPOSE 5000
ENTRYPOINT ["python", "/plexscanarr/source/main.py"]
