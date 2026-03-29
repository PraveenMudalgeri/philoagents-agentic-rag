"""Embedding generation and vector storage for the data pipeline."""

import logging
import os

from sentence_transformers import SentenceTransformer
from pymongo import MongoClient, UpdateOne

logger = logging.getLogger(__name__)

_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
_BATCH_SIZE = int(os.getenv("EMBEDDING_BATCH_SIZE", "64"))


def embed_chunks(chunks: list[dict]) -> list[dict]:
    """Generate embeddings for each text chunk.

    Args:
        chunks: List of chunk dicts with at least a 'text' field.

    Returns:
        The same chunks with an 'embedding' field added.
    """
    model = SentenceTransformer(_MODEL_NAME)
    texts = [c["text"] for c in chunks]
    logger.info("Embedding %d chunks with model '%s'", len(texts), _MODEL_NAME)

    vectors = model.encode(texts, batch_size=_BATCH_SIZE, show_progress_bar=True).tolist()
    for chunk, vec in zip(chunks, vectors):
        chunk["embedding"] = vec
    return chunks


def store_in_mongodb(chunks: list[dict]) -> None:
    """Upsert embedded chunks into MongoDB Atlas.

    Args:
        chunks: Chunks with 'philosopher_id', 'url', 'chunk_index', 'text', 'embedding'.
    """
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB", "philoagents")
    collection_name = os.getenv("MONGODB_VECTOR_COLLECTION", "philosopher_knowledge")

    client = MongoClient(uri)
    collection = client[db_name][collection_name]

    operations = [
        UpdateOne(
            {"philosopher_id": c["philosopher_id"], "url": c["url"], "chunk_index": c["chunk_index"]},
            {"$set": c},
            upsert=True,
        )
        for c in chunks
    ]
    result = collection.bulk_write(operations)
    logger.info(
        "Upserted %d chunks (modified: %d, inserted: %d)",
        len(chunks),
        result.modified_count,
        result.upserted_count,
    )


if __name__ == "__main__":
    import json

    logging.basicConfig(level=logging.INFO)
    chunks_path = os.path.join(os.path.dirname(__file__), "..", "chunking", "chunks.json")
    with open(chunks_path, "r", encoding="utf-8") as fh:
        chunks = json.load(fh)

    embedded = embed_chunks(chunks)
    store_in_mongodb(embedded)
    logger.info("Pipeline complete.")
