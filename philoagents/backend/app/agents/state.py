"""LangGraph agent state definition."""

from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """State passed between nodes in the LangGraph agent."""

    messages: Annotated[list[BaseMessage], add_messages]
