"""Chat route: handles both REST and WebSocket conversations."""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.agents.philosopher_agent import PhilosopherAgent
from app.memory.mongodb import get_conversation_history, save_message
from app.websocket.manager import ConnectionManager

logger = logging.getLogger(__name__)

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/chat/{philosopher_id}/{session_id}")
async def websocket_chat(
    websocket: WebSocket,
    philosopher_id: str,
    session_id: str,
):
    """Stream philosopher responses token-by-token via WebSocket."""
    await manager.connect(websocket)
    agent = PhilosopherAgent(philosopher_id=philosopher_id)

    try:
        while True:
            user_message = await websocket.receive_text()
            logger.info(
                "Received message for %s [session=%s]: %s",
                philosopher_id,
                session_id,
                user_message,
            )

            history = await get_conversation_history(session_id)

            full_response = ""
            async for token in agent.stream_response(
                user_message=user_message,
                conversation_history=history,
            ):
                await manager.send_text(token, websocket)
                full_response += token

            await manager.send_text("[DONE]", websocket)

            await save_message(session_id, "user", user_message)
            await save_message(session_id, "assistant", full_response)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket disconnected for session %s", session_id)
    except Exception as exc:
        logger.exception("Unexpected error in websocket_chat: %s", exc)
        manager.disconnect(websocket)
