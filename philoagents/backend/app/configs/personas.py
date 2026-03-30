"""Persona loader for philosopher characters."""

import json
import logging
import os
from functools import lru_cache

logger = logging.getLogger(__name__)

_PERSONA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "configs", "personas")


@lru_cache(maxsize=32)
def load_persona(philosopher_id: str) -> dict:
    """Load a philosopher persona from a JSON config file.

    Args:
        philosopher_id: The philosopher identifier (e.g. 'socrates').

    Returns:
        A dict containing persona fields (name, system_prompt, etc.).

    Raises:
        FileNotFoundError: If no persona file exists for the given id.
    """
    path = os.path.join(_PERSONA_DIR, f"{philosopher_id}.json")
    if not os.path.exists(path):
        logger.warning("Persona file not found for '%s', using default.", philosopher_id)
        return _default_persona(philosopher_id)

    with open(path, "r", encoding="utf-8") as fh:
        persona = json.load(fh)
    logger.info("Loaded persona for '%s'", philosopher_id)
    return persona


def _default_persona(philosopher_id: str) -> dict:
    """Return a minimal default persona."""
    return {
        "id": philosopher_id,
        "name": philosopher_id.capitalize(),
        "system_prompt": (
            f"You are {philosopher_id.capitalize()}, a friendly body-part guide for children. "
            "Respond in simple language, short sentences, and include one helpful follow-up question."
        ),
    }
