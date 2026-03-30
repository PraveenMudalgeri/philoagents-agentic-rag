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
    logger.info(
        f"WebSocket connected for philosopher: {philosopher_id}, session: {session_id}"
    )

    try:
        logger.info(f"Initializing PhilosopherAgent for philosopher_id: {philosopher_id}")
        agent = PhilosopherAgent(philosopher_id=philosopher_id)
        logger.info(f"PhilosopherAgent initialized successfully for {philosopher_id}")

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
            response_sent = False

            try:
                async for token in agent.stream_response(
                    user_message=user_message,
                    conversation_history=history,
                ):
                    if token and token != "[DONE]":
                        response_sent = True
                    await manager.send_text(token, websocket)
                    full_response += token
            except Exception as stream_exc:
                logger.exception("Error during response stream: %s", stream_exc)
                await manager.send_text(
                    "⚠️ Sorry, I could not generate an answer right now. Please try again.",
                    websocket,
                )
                await manager.send_text("[DONE]", websocket)
                continue

            if not response_sent:
                fallback = (
                    "⚠️ I could not generate a response with the current data. "
                    "Try asking another simple question."
                )
                await manager.send_text(fallback, websocket)
                full_response += fallback

            await manager.send_text("[DONE]", websocket)
            await save_message(session_id, "user", user_message)
            await save_message(session_id, "assistant", full_response)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for session %s", session_id)
    except Exception as exc:
        logger.exception("Unexpected error in websocket_chat: %s", exc)
    finally:
        manager.disconnect(websocket)
        try:
            await websocket.close()
        except Exception:
            pass
