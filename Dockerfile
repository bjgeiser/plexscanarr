# FROM --platform=linux/amd64 ubuntu:22.04 as react_builder
FROM node:23-alpine as react_builder

WORKDIR /web
COPY /web/. .

RUN npm install
RUN npm run build

FROM ghcr.io/astral-sh/uv:python3.13-alpine
#set the working directory to /bright/
RUN apk add --no-cache gcc python3-dev musl-dev linux-headers
WORKDIR /plexscanarr
COPY VERSION pyproject.toml /plexscanarr/
#COPY web /plexscanarr/web
COPY --from=react_builder /web /plexscanarr/web
COPY source /plexscanarr/source

# RUN curl -LsSf https://astral.sh/uv/install.sh | sh
RUN uv pip install --system -e .


EXPOSE 5000
ENTRYPOINT ["python", "/plexscanarr/source/main.py"]
