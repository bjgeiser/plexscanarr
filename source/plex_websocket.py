import logging
import classy_fastapi as cfa

import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import websockets
from typing import List
from fastapi.responses import FileResponse
import logging
import json
from asyncio import Queue

logger = logging.getLogger(__name__)


class Connection:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.queue = asyncio.Queue()
        self.relay_task = asyncio.create_task(Connection.relay(self.queue, self.websocket))

    def close(self):
        self.relay_task.cancel()

    @staticmethod
    async def relay(queue, websocket):
        while True:
            message = await queue.get()
            await websocket.send_text(message)

    def enqueue_message(self, message):
        self.queue.put_nowait(message)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[Connection] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()

        # Create a connection object and put it into the list
        conn = Connection(websocket)
        self.active_connections.append(conn)
        return conn

    def disconnect(self, conn: Connection):
        conn.close()
        self.active_connections.remove(conn)

    async def send_message_to_one_client(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        # logger.debug(f"Broadcasting: {message}")
        for connection in self.active_connections:
            connection.enqueue_message(message)

    def disconnect_all(self):
        for connection in self.active_connections:
            connection.close()
        self.active_connections = []


class PlexWebsocket(cfa.Routable):
    def __init__(self, handle_rx):
        super().__init__()
        self.handle_rx = handle_rx
        self.connection_manager = ConnectionManager()

    @cfa.websocket("/ws")
    async def websocket_endpoint(self, websocket: WebSocket):
        connection = await self.connection_manager.connect(websocket)
        try:
            # await send_current_state(websocket)

            while True:
                data = await websocket.receive_text()
                if self.handle_rx is not None:
                    self.handle_rx(data)

        except WebSocketDisconnect:
            self.connection_manager.disconnect(connection)


# last_values = {"label": {}, "disabled": {}, "progress": {}}
# stored_logs = []
#
# async def send_current_state(websocket):
#    global stored_logs, last_values
#
#    for key in last_values.keys():
#        for _id in last_values[key].keys():
#            await websocket.send_text(last_values[key][_id])
#    for log in stored_logs:
#        await websocket.send_text(log)
#
#
# def update_progress(identifier, value):
#    global last_values
#
#    msg_json = {"type": "progress", "params": {"id": identifier, "value": value}}
#    json_str = json.dumps(msg_json)
#
#    last_values[msg_json["type"]][identifier] = json_str
#
#    queue.put_nowait(json_str)
#
#
# def update_label(identifier, value):
#    global last_values
#
#    msg_json = {"type": "label", "params": {"id": identifier, "value": value}}
#    json_str = json.dumps(msg_json)
#
#    last_values[msg_json["type"]][identifier] = json_str
#
#    queue.put_nowait(json_str)
#
#
# def element_disabled(identifier, value):
#    msg_json = {"type": "disabled", "params": {"id": identifier, "value": value}}
#    json_str = json.dumps(msg_json)
#
#    last_values[msg_json["type"]][identifier] = json_str
#
#    queue.put_nowait(json_str)
#
#
# def log_to_websocket(message, level):
#    global stored_logs
#
#    msg_json = {"type": "log", "params": {"level": level.lower(), "message": message}}
#    json_str = json.dumps(msg_json)
#
#    if len(stored_logs) > 50:
#        stored_logs.pop(0)
#    stored_logs.append(json_str)
#
#    queue.put_nowait(json_str)
#
#
# async def run_logging():
#    try:
#        while True:
#            msg = await queue.get()
#
#            await manager.broadcast(msg)
#    except asyncio.QueueEmpty:
#        pass
#    except WebSocketDisconnect:
#        pass


class WebsocketLogHandler(logging.Handler):
    global stored_logs

    def __init__(self, my_loop=None):
        self.loop = my_loop
        super().__init__()

    def emit(self, record):
        log_to_websocket(self.format(record), record.levelname.lower())
