"""LangGraph-based philosopher agent with agentic RAG."""

import logging
import os
from typing import AsyncIterator

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.configs.personas import load_persona
from app.rag.retriever import retrieve_context
from app.utils.opik_tracer import get_tracer

MAX_RECENT_TOPICS = 5
logger = logging.getLogger(__name__)


class PhilosopherAgent:
    """Simplified philosopher agent (direct Groq streaming + optional RAG context)."""

    def __init__(self, philosopher_id: str) -> None:
        self.philosopher_id = philosopher_id
        self._persona = load_persona(philosopher_id)
        self._llm = ChatGroq(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            api_key=os.getenv("GROQ_API_KEY", ""),
            streaming=True,
        )
        self._tracer = get_tracer()

    async def stream_response(
        self,
        user_message: str,
        conversation_history: list[dict],
    ) -> AsyncIterator[str]:
        """Yield LLM response tokens for the given user message."""
        # Build system prompt with safety/style guidelines.
        style_guardrails = (
            "Keep explanations child-friendly: simple words, short sentences, and clear examples. "
            "Avoid repeating the exact same explanation if the topic already appeared in recent messages. "
            "When relevant, end with a short follow-up suggestion or tiny quiz question."
        )

        history_messages = []
        for entry in conversation_history:
            role = entry.get("role")
            content = entry.get("content", "")
            if role == "user":
                history_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                history_messages.append(AIMessage(content=content))

        retrieval_context = ""
        try:
            docs = await retrieve_context(query=user_message, body_part_id=self.philosopher_id)
            if docs:
                retrieval_context = "\n\n".join(docs)
        except Exception as err:
            logger.warning("RAG retrieval failed: %s", err)

        system_content = f"{self._persona['system_prompt']}\n\n{style_guardrails}"
        if retrieval_context:
            system_content += f"\n\nRelevant knowledge from body part '{self.philosopher_id}':\n{retrieval_context}"

        messages = [SystemMessage(content=system_content)] + history_messages + [HumanMessage(content=user_message)]

        # Stream response chunks from Groq.
        try:
            for chunk in self._llm.stream(messages):
                if chunk is None:
                    continue
                if isinstance(chunk, str):
                    token = chunk.strip()
                    if token:
                        yield token
                else:
                    content = getattr(chunk, "content", "")
                    if isinstance(content, list):
                        for c in content:
                            if isinstance(c, str) and c.strip():
                                yield c
                    elif isinstance(content, str) and content.strip():
                        yield content
        except Exception as exc:
            logger.exception("LLM streaming failed: %s", exc)
            yield "⚠️ Sorry, I couldn\'t generate an answer right now."

