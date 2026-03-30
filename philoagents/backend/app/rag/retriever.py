"""Vector-search retrieval using MongoDB Atlas Vector Search."""

import logging
import os
from typing import Any

from pymongo import MongoClient

from app.rag.embeddings import embed_query

logger = logging.getLogger(__name__)

_COLLECTION = os.getenv("MONGODB_VECTOR_COLLECTION", "body_knowledge")
_INDEX_NAME = os.getenv("MONGODB_VECTOR_INDEX", "vector_index")
_TOP_K = int(os.getenv("RAG_TOP_K", "5"))


def _get_sync_collection():
    """Return a synchronous pymongo collection for vector search."""
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB", "philoagents")
    client = MongoClient(uri)
    return client[db_name][_COLLECTION]


async def retrieve_context(query: str, body_part_id: str) -> list[str]:
    """Perform text search and return top-k text passages.

    Args:
        query: The user query string.
        body_part_id: Filter results to a specific body-part NPC.

    Returns:
        A list of relevant text passages.
    """
    collection = _get_sync_collection()

    # Use simple text search for local MongoDB (Atlas-only features not available)
    pipeline: list[dict[str, Any]] = [
        {
            "$match": {
                "body_part_id": body_part_id,
                "$text": {"$search": query}
            }
        },
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "score": {"$meta": "textScore"}
            }
        },
        {"$sort": {"score": {"$meta": "textScore"}}},
        {"$limit": _TOP_K}
    ]

    try:
        results = list(collection.aggregate(pipeline))
        passages = [doc["text"] for doc in results if "text" in doc]
    except Exception:
        # Fallback: just get all documents for this body part
        logger.warning("Text search failed, falling back to simple filter")
        results = list(collection.find({"body_part_id": body_part_id}).limit(_TOP_K))
        passages = [doc["text"] for doc in results if "text" in doc]

    logger.info(
        "Retrieved %d passages for body part '%s'", len(passages), body_part_id
    )
    return passages
