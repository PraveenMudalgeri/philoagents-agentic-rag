"""Educational human-body content scraper."""

import logging
import os
import time
from typing import Iterator

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

BODY_PARTS = {
    "heart": [
        "https://en.wikipedia.org/wiki/Heart",
        "https://kidshealth.org/en/kids/heart.html",
    ],
    "brain": [
        "https://en.wikipedia.org/wiki/Brain",
        "https://kidshealth.org/en/kids/brain.html",
    ],
    "lungs": [
        "https://en.wikipedia.org/wiki/Lung",
        "https://kidshealth.org/en/kids/lungs.html",
    ],
    "digestive_system": [
        "https://en.wikipedia.org/wiki/Human_digestive_system",
        "https://kidshealth.org/en/kids/digestive-system.html",
    ],
    "bones": [
        "https://en.wikipedia.org/wiki/Human_skeleton",
        "https://kidshealth.org/en/kids/bones.html",
    ],
}

STRUCTURED_KNOWLEDGE = {
    "heart": (
        "The heart is a strong muscle that pumps blood around the body. "
        "Blood carries oxygen and nutrients so cells can make energy. "
        "A healthy heart beats faster when you run and slower when you rest."
    ),
    "brain": (
        "The brain is the body's control center. "
        "It helps with thinking, memory, emotions, and movement. "
        "Sleep helps the brain organize what you learned during the day."
    ),
    "lungs": (
        "The lungs help us breathe. "
        "They bring oxygen into the body and remove carbon dioxide. "
        "During exercise, lungs work harder to supply more oxygen."
    ),
    "digestive_system": (
        "The digestive system breaks food into nutrients and energy. "
        "Food moves from mouth to stomach and then through the intestines. "
        "Water and fiber help digestion work smoothly."
    ),
    "bones": (
        "Bones form the skeleton that gives shape and support to the body. "
        "Bones protect organs, like the skull protecting the brain. "
        "Calcium, vitamin D, and movement help keep bones strong."
    ),
}

_HEADERS = {"User-Agent": "PhiloAgents-Scraper/1.0 (educational project)"}
_REQUEST_DELAY = float(os.getenv("SCRAPER_DELAY_SECONDS", "1.5"))


def scrape_url(url: str) -> str:
    """Download and return the main text content of a web page.

    Args:
        url: The URL to scrape.

    Returns:
        Cleaned plain text extracted from the page.
    """
    response = requests.get(url, headers=_HEADERS, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    # Remove scripts, styles, and navigation
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    return text


def scrape_body_part(body_part_id: str) -> Iterator[dict]:
    """Yield raw document dicts for all configured educational sources of a body part.

    Args:
        body_part_id: Body-part identifier key.

    Yields:
        Dicts with keys: philosopher_id, url, text.
    """
    base_text = STRUCTURED_KNOWLEDGE.get(body_part_id)
    if base_text:
        yield {
            "philosopher_id": body_part_id,
            "url": "local://structured_knowledge",
            "text": base_text,
        }

    urls = BODY_PARTS.get(body_part_id, [])
    for url in urls:
        try:
            logger.info("Scraping %s", url)
            text = scrape_url(url)
            yield {"philosopher_id": body_part_id, "url": url, "text": text}
            time.sleep(_REQUEST_DELAY)
        except Exception as exc:
            logger.error("Failed to scrape %s: %s", url, exc)


def scrape_all() -> list[dict]:
    """Scrape all configured body parts and return raw documents."""
    docs = []
    for body_part_id in BODY_PARTS:
        docs.extend(scrape_body_part(body_part_id))
    logger.info("Scraped %d documents total", len(docs))
    return docs


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    raw_docs = scrape_all()
    import json

    output_path = os.path.join(os.path.dirname(__file__), "raw_docs.json")
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(raw_docs, fh, ensure_ascii=False, indent=2)
    logger.info("Saved raw docs to %s", output_path)
