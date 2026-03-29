"""MongoDB integration for short-term (conversation) and long-term (vector) memory."""

import logging
import os
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    """Open a connection to MongoDB Atlas."""
    global _client, _db
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB", "philoagents")
    _client = AsyncIOMotorClient(uri)
    _db = _client[db_name]
    logger.info("Connected to MongoDB database '%s'", db_name)


async def close_mongo_connection() -> None:
    """Close the MongoDB connection."""
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance."""
    if _db is None:
        raise RuntimeError("MongoDB is not connected. Call connect_to_mongo() first.")
    return _db


# ---------------------------------------------------------------------------
# Short-term memory helpers
# ---------------------------------------------------------------------------

async def get_conversation_history(session_id: str) -> list[dict[str, Any]]:
    """Retrieve the conversation history for a session (ordered oldest-first)."""
    db = get_database()
    cursor = db["conversations"].find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("timestamp", 1)
    return await cursor.to_list(length=None)


async def save_message(session_id: str, role: str, content: str) -> None:
    """Persist a single conversation message."""
    import datetime

    db = get_database()
    await db["conversations"].insert_one(
        {
            "session_id": session_id,
            "role": role,
            "content": content,
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
        }
    )
