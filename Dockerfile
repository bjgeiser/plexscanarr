FROM python:3.13

#set the working directory to /bright/
WORKDIR /plexscanarr
COPY VERSION pyproject.toml ./web /plexscanarr/
COPY web /plexscanarr/web
COPY source /plexscanarr/source

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"
RUN uv pip install --system -e .


EXPOSE 5000
ENTRYPOINT ["python", "/plexscanarr/source/main.py"]
