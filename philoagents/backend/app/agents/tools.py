"""LangGraph tools for the philosopher agent."""

import logging

from langchain_core.tools import tool

from app.rag.retriever import retrieve_context

logger = logging.getLogger(__name__)


def build_retrieval_tool(body_part_id: str):
    """Return a retrieval tool scoped to the given body-part NPC."""

    @tool
    async def retrieve_body_part_knowledge(query: str) -> str:
        """Search the body-part knowledge base for relevant context.

        Args:
            query: The semantic search query.

        Returns:
            Retrieved passages as a single string.
        """
        docs = await retrieve_context(query=query, body_part_id=body_part_id)
        if not docs:
            return "No relevant knowledge found."
        return "\n\n".join(docs)

    return retrieve_body_part_knowledge
