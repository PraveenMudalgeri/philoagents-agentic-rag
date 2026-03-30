"""Persona loader for educational body-part NPCs."""

import json
import logging
import os
from functools import lru_cache

logger = logging.getLogger(__name__)

_PERSONA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "configs", "personas")


@lru_cache(maxsize=32)
def load_persona(body_part_id: str) -> dict:
    """Load a body-part persona from a JSON config file.

    Args:
        body_part_id: The body-part identifier (e.g. 'heart').

    Returns:
        A dict containing persona fields (name, system_prompt, etc.).

    Raises:
        FileNotFoundError: If no persona file exists for the given id.
    """
    path = os.path.join(_PERSONA_DIR, f"{body_part_id}.json")
    if not os.path.exists(path):
        logger.warning("Persona file not found for '%s', using default.", body_part_id)
        return _default_persona(body_part_id)

    with open(path, "r", encoding="utf-8") as fh:
        persona = json.load(fh)
    logger.info("Loaded persona for '%s'", body_part_id)
    return persona


def _default_persona(body_part_id: str) -> dict:
    """Return a minimal default persona."""
    return {
        "id": body_part_id,
        "name": body_part_id.capitalize(),
        "system_prompt": (
            f"You are {body_part_id.capitalize()}, a friendly body-part guide for children. "
            "Respond in simple language, short sentences, and include one helpful follow-up question."
        ),
    }
