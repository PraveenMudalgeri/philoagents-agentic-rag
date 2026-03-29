"""FastAPI entry point for PhiloAgents backend."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, health
from app.memory.mongodb import close_mongo_connection, connect_to_mongo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan: startup and shutdown events."""
    logger.info("Starting PhiloAgents backend...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down PhiloAgents backend...")
    await close_mongo_connection()


app = FastAPI(
    title="PhiloAgents API",
    description="Agentic RAG backend for philosopher NPC conversations",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
