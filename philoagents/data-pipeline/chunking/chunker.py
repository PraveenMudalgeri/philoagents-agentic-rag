"""Text chunking utilities for the data pipeline."""

import logging
import re
from typing import Iterator

logger = logging.getLogger(__name__)

_DEFAULT_CHUNK_SIZE = 500
_DEFAULT_OVERLAP = 50


def clean_text(text: str) -> str:
    """Remove excessive whitespace and normalise line endings.

    Args:
        text: Raw text to clean.

    Returns:
        Cleaned text string.
    """
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = _DEFAULT_CHUNK_SIZE,
    overlap: int = _DEFAULT_OVERLAP,
) -> list[str]:
    """Split text into overlapping word-based chunks.

    Args:
        text: The text to split.
        chunk_size: Target number of words per chunk.
        overlap: Number of words to overlap between consecutive chunks.

    Returns:
        A list of text chunk strings.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0
    step = max(1, chunk_size - overlap)

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start += step

    return chunks


def process_documents(raw_docs: list[dict]) -> Iterator[dict]:
    """Clean and chunk a list of raw documents.

    Args:
        raw_docs: Documents with 'philosopher_id', 'url', 'text'.

    Yields:
        Chunk dicts with 'philosopher_id', 'url', 'chunk_index', 'text'.
    """
    for doc in raw_docs:
        cleaned = clean_text(doc.get("text", ""))
        chunks = chunk_text(cleaned)
        for i, chunk in enumerate(chunks):
            yield {
                "philosopher_id": doc["philosopher_id"],
                "url": doc.get("url", ""),
                "chunk_index": i,
                "text": chunk,
            }


if __name__ == "__main__":
    import json
    import os

    logging.basicConfig(level=logging.INFO)
    raw_path = os.path.join(os.path.dirname(__file__), "..", "scraper", "raw_docs.json")
    with open(raw_path, "r", encoding="utf-8") as fh:
        raw_docs = json.load(fh)

    chunks = list(process_documents(raw_docs))
    logger.info("Generated %d chunks", len(chunks))

    output_path = os.path.join(os.path.dirname(__file__), "chunks.json")
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(chunks, fh, ensure_ascii=False, indent=2)
    logger.info("Saved chunks to %s", output_path)
