"""Embedding utilities using sentence-transformers."""

import asyncio
import logging
import os
from functools import lru_cache

logger = logging.getLogger(__name__)

_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def _get_model():
    """Lazy-load and cache the embedding model."""
    from sentence_transformers import SentenceTransformer

    logger.info("Loading embedding model '%s'", _MODEL_NAME)
    return SentenceTransformer(_MODEL_NAME)


async def embed_query(text: str) -> list[float]:
    """Asynchronously embed a single query string.

    Args:
        text: The text to embed.

    Returns:
        A list of floats representing the embedding vector.
    """
    loop = asyncio.get_event_loop()
    model = _get_model()
    vector = await loop.run_in_executor(None, lambda: model.encode(text).tolist())
    return vector


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts.

    Args:
        texts: A list of strings to embed.

    Returns:
        A list of embedding vectors.
    """
    loop = asyncio.get_event_loop()
    model = _get_model()
    vectors = await loop.run_in_executor(
        None, lambda: model.encode(texts, show_progress_bar=False).tolist()
    )
    return vectors
