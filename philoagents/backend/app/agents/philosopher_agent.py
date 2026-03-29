"""LangGraph-based philosopher agent with agentic RAG."""

import logging
import os
from typing import AsyncIterator

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from app.agents.state import AgentState
from app.agents.tools import build_retrieval_tool
from app.configs.personas import load_persona
from app.utils.opik_tracer import get_tracer

logger = logging.getLogger(__name__)


def _build_graph(philosopher_id: str):
    """Construct the LangGraph agent graph for a philosopher."""
    persona = load_persona(philosopher_id)
    retrieval_tool = build_retrieval_tool(philosopher_id)
    tools = [retrieval_tool]

    llm = ChatGroq(
        model=os.getenv("GROQ_MODEL", "llama3-70b-8192"),
        api_key=os.getenv("GROQ_API_KEY", ""),
        streaming=True,
    ).bind_tools(tools)

    tool_node = ToolNode(tools)

    def agent_node(state: AgentState) -> AgentState:
        system_prompt = SystemMessage(content=persona["system_prompt"])
        messages = [system_prompt] + state["messages"]
        response = llm.invoke(messages)
        return {"messages": state["messages"] + [response]}

    def should_continue(state: AgentState) -> str:
        last = state["messages"][-1]
        if isinstance(last, AIMessage) and last.tool_calls:
            return "tools"
        return END

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")

    return graph.compile()


class PhilosopherAgent:
    """Wraps a compiled LangGraph agent for a specific philosopher."""

    def __init__(self, philosopher_id: str) -> None:
        self.philosopher_id = philosopher_id
        self._graph = _build_graph(philosopher_id)
        self._tracer = get_tracer()

    async def stream_response(
        self,
        user_message: str,
        conversation_history: list[dict],
    ) -> AsyncIterator[str]:
        """Yield response tokens for the given user message."""
        messages = []
        for entry in conversation_history:
            role = entry.get("role")
            content = entry.get("content", "")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))

        messages.append(HumanMessage(content=user_message))
        state: AgentState = {"messages": messages}

        async for event in self._graph.astream(state, stream_mode="messages"):
            for msg in event if isinstance(event, list) else [event]:
                if isinstance(msg, AIMessage) and not msg.tool_calls:
                    chunk = msg.content
                    if chunk:
                        yield chunk
