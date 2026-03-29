"""Wikipedia and Stanford Encyclopedia of Philosophy scraper."""

import logging
import os
import time
from typing import Iterator

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

PHILOSOPHERS = {
    "socrates": [
        "https://en.wikipedia.org/wiki/Socrates",
        "https://plato.stanford.edu/entries/socrates/",
    ],
    "plato": [
        "https://en.wikipedia.org/wiki/Plato",
        "https://plato.stanford.edu/entries/plato/",
    ],
    "aristotle": [
        "https://en.wikipedia.org/wiki/Aristotle",
        "https://plato.stanford.edu/entries/aristotle/",
    ],
    "nietzsche": [
        "https://en.wikipedia.org/wiki/Friedrich_Nietzsche",
        "https://plato.stanford.edu/entries/nietzsche/",
    ],
    "kant": [
        "https://en.wikipedia.org/wiki/Immanuel_Kant",
        "https://plato.stanford.edu/entries/kant/",
    ],
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


def scrape_philosopher(philosopher_id: str) -> Iterator[dict]:
    """Yield raw document dicts for all URLs of a philosopher.

    Args:
        philosopher_id: Philosopher identifier key.

    Yields:
        Dicts with keys: philosopher_id, url, text.
    """
    urls = PHILOSOPHERS.get(philosopher_id, [])
    for url in urls:
        try:
            logger.info("Scraping %s", url)
            text = scrape_url(url)
            yield {"philosopher_id": philosopher_id, "url": url, "text": text}
            time.sleep(_REQUEST_DELAY)
        except Exception as exc:
            logger.error("Failed to scrape %s: %s", url, exc)


def scrape_all() -> list[dict]:
    """Scrape all configured philosophers and return raw documents."""
    docs = []
    for philosopher_id in PHILOSOPHERS:
        docs.extend(scrape_philosopher(philosopher_id))
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
