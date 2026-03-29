"""Opik tracer integration for LLMOps observability."""

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


class NoOpTracer:
    """Fallback tracer that does nothing when Opik is not configured."""

    def trace(self, *args: Any, **kwargs: Any) -> None:
        pass


def get_tracer() -> Any:
    """Return an Opik tracer if configured, otherwise a no-op tracer."""
    opik_api_key = os.getenv("OPIK_API_KEY", "")
    if not opik_api_key:
        logger.debug("OPIK_API_KEY not set – using no-op tracer")
        return NoOpTracer()

    try:
        import opik

        tracer = opik.Opik(api_key=opik_api_key)
        logger.info("Opik tracer initialised")
        return tracer
    except ImportError:
        logger.warning("opik package not installed – using no-op tracer")
        return NoOpTracer()
