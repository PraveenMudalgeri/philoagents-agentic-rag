"""Vector-search retrieval using MongoDB Atlas Vector Search."""

import logging
import os
from typing import Any

from pymongo import MongoClient

from app.rag.embeddings import embed_query

logger = logging.getLogger(__name__)

_COLLECTION = os.getenv("MONGODB_VECTOR_COLLECTION", "philosopher_knowledge")
_INDEX_NAME = os.getenv("MONGODB_VECTOR_INDEX", "vector_index")
_TOP_K = int(os.getenv("RAG_TOP_K", "5"))


def _get_sync_collection():
    """Return a synchronous pymongo collection for vector search."""
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB", "philoagents")
    client = MongoClient(uri)
    return client[db_name][_COLLECTION]


async def retrieve_context(query: str, philosopher_id: str) -> list[str]:
    """Perform vector search and return top-k text passages.

    Args:
        query: The user query string.
        philosopher_id: Filter results to a specific philosopher.

    Returns:
        A list of relevant text passages.
    """
    query_vector = await embed_query(query)
    collection = _get_sync_collection()

    pipeline: list[dict[str, Any]] = [
        {
            "$vectorSearch": {
                "index": _INDEX_NAME,
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": _TOP_K * 10,
                "limit": _TOP_K,
                "filter": {"philosopher_id": philosopher_id},
            }
        },
        {"$project": {"_id": 0, "text": 1, "score": {"$meta": "vectorSearchScore"}}},
    ]

    results = list(collection.aggregate(pipeline))
    passages = [doc["text"] for doc in results if "text" in doc]
    logger.info(
        "Retrieved %d passages for philosopher '%s'", len(passages), philosopher_id
    )
    return passages
