from fastapi import WebSocket
import classy_fastapi as cfa


class WebsocketService(cfa.Routable):
    @cfa.websocket("/ws")
    async def websocket_endpoint(self, websocket: WebSocket):
        await websocket.accept()
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
