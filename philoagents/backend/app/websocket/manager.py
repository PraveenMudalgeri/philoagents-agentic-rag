"""WebSocket connection manager."""

import logging
from typing import List

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage active WebSocket connections."""

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket connected. Total connections: %d", len(self.active_connections))

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a connection from the active list."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info("WebSocket disconnected. Total connections: %d", len(self.active_connections))

    async def send_text(self, message: str, websocket: WebSocket) -> None:
        """Send a text message to a specific WebSocket client."""
        await websocket.send_text(message)

    async def broadcast(self, message: str) -> None:
        """Broadcast a text message to all connected clients."""
        for connection in list(self.active_connections):
            await connection.send_text(message)
