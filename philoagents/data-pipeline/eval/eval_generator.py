"""Evaluation dataset generation and RAG quality evaluation."""

import json
import logging
import os
import random

logger = logging.getLogger(__name__)


def generate_eval_dataset(chunks: list[dict], num_samples: int = 50) -> list[dict]:
    """Generate simple question/context evaluation pairs from chunks.

    For production use, replace with an LLM-generated Q&A pipeline.

    Args:
        chunks: List of text chunks.
        num_samples: Number of evaluation samples to generate.

    Returns:
        A list of evaluation dicts with 'question', 'context', 'philosopher_id'.
    """
    samples = random.sample(chunks, min(num_samples, len(chunks)))
    eval_data = []
    for chunk in samples:
        text = chunk.get("text", "")
        # Use the first sentence as a naive "question seed"
        first_sentence = text.split(". ")[0].strip()
        question = f"What do you know about: {first_sentence}?"
        eval_data.append(
            {
                "philosopher_id": chunk.get("philosopher_id", ""),
                "question": question,
                "context": text,
                "source_url": chunk.get("url", ""),
            }
        )
    return eval_data


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    chunks_path = os.path.join(os.path.dirname(__file__), "..", "chunking", "chunks.json")
    with open(chunks_path, "r", encoding="utf-8") as fh:
        chunks = json.load(fh)

    eval_data = generate_eval_dataset(chunks)
    output_path = os.path.join(os.path.dirname(__file__), "eval_dataset.json")
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(eval_data, fh, ensure_ascii=False, indent=2)
    logger.info("Saved %d eval samples to %s", len(eval_data), output_path)
