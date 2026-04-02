# BodyAgents — Agentic RAG Educational NPC Engine

An educational demo system that turns static game NPCs into interactive, memory-enabled conversational agents using Agentic RAG, a dual-memory design, and real-time token streaming.

This repository contains a FastAPI backend (agentic RAG + streaming LLM), a Phaser.js frontend demo, and an offline data pipeline to scrape, chunk, embed, and store verified educational content in MongoDB.

---

## Quick links

- Repository: https://github.com/PraveenMudalgeri/philoagents-agentic-rag
- Backend entry: `philoagents/backend/app/main.py`
- Frontend: `philoagents/frontend`
- Data pipeline: `philoagents/data-pipeline`
- Persona configs: `philoagents/configs/personas/`
- Example env: `.env.example`

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quickstart (Docker)](#quickstart-docker)
- [Local development](#local-development)
- [Data pipeline](#data-pipeline)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Contributing](#contributing)

---

## Overview

BodyAgents (PhiloAgents) provides playable, child-friendly body-part NPCs (Brain, Heart, Lungs, Bones, Digestive System) that:

- Answer questions using a streaming LLM (Groq)
- Retrieve relevant, verified context from a vector-backed long-term store (MongoDB)
- Maintain short-term conversational memory per session
- Stream token-by-token responses to the frontend over WebSocket

This makes it suitable as a research/demo platform for agentic RAG, LLMops tracing, and interactive educational experiences.

## Features

- Real-time token streaming over WebSocket
- Dual-memory: short-term conversation store + long-term vector store
- Offline pipeline for scraping, chunking, embedding, and upserting content
- Persona-driven system prompts for body-part characters
- Opik-based tracing for observability (optional)

---

## Architecture (short)

Frontend (Phaser.js) ← WebSocket → FastAPI backend (LangGraph agent + Groq LLM) → MongoDB (conversations + vector store)

Key flow: user message → short-term history → optional retrieval → final prompt (persona + history + retrieved) → LLM stream → frontend
 
```mermaid
flowchart LR
	subgraph Frontend
		A[Phaser.js Frontend\nChat UI / ChatManager]
	end
	subgraph Backend
		B[FastAPI\nWebSocket: /api/v1/ws/chat/{philosopher_id}/{session_id}]
		C[ConnectionManager\nWebSocket manager]
		D[PhilosopherAgent\nLangGraph + ChatGroq]
		E[Retrieval Tool\nphiloagents/backend/app/rag/retriever.py]
		F[Opik Tracer\n(opik tracer)]
	end
	subgraph DB
		G[MongoDB\nconversations & body_knowledge (vectors)]
	end
	subgraph Pipeline
		H[Data Pipeline\nscraper → chunker → embeddings → upsert]
	end

	A -->|WebSocket| B
	B --> C
	C --> D
	D --> E
	E --> G
	D -->|Stream tokens| A
	B -->|save/load| G
	D --> F
	H -->|upsert embeddings| G
```
---

## Quickstart (Docker)

Prerequisites:

- Docker & Docker Compose
- A MongoDB Atlas cluster (or use local MongoDB)
- GROQ API key (set `GROQ_API_KEY` in `.env`)

1. Clone and prepare env:

```bash
git clone https://github.com/PraveenMudalgeri/philoagents-agentic-rag.git
cd philoagents-agentic-rag
cp .env.example .env
# Edit .env with your values (GROQ_API_KEY, MONGODB_URI, ...)
```

2. Start with Docker Compose:

```bash
docker-compose up --build
```

Default services:

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

Open the API docs at: http://localhost:8000/docs

---

## Local development

Backend (Python 3.11):

```bash
cd philoagents/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (Node.js):

```bash
cd philoagents/frontend
npm install
npm run dev
```

Notes:

- The Docker setup copies `backend/app` into the container and runs `uvicorn app.main:app` (see `philoagents/backend/Dockerfile`).
- WebSocket path for chat: `ws://localhost:8000/api/v1/ws/chat/{philosopher_id}/{session_id}`

---

## Data pipeline

The data pipeline scrapes sources, chunks text, computes embeddings, and upserts vectors to MongoDB.

Run the pipeline (one-time) from the repo root:

```bash
cd philoagents/data-pipeline
pip install -r requirements.txt

# Scrape sources
python scraper/scraper.py

# Chunk scraped text
python chunking/chunker.py

# Embed and upsert to MongoDB Atlas
python embeddings/embed_and_store.py
```

After loading embeddings, create a Vector Search index in MongoDB Atlas for the `body_knowledge` collection (embedding vector field and a filter on `body_part_id`).

---

## Configuration

Copy `.env.example` to `.env` and fill in required values. Important variables:

- `GROQ_API_KEY`: Groq API key for LLM calls
- `GROQ_MODEL`: Groq model name (default: `llama3-70b-8192`)
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name (default: `philoagents`)
- `MONGODB_VECTOR_COLLECTION`: Vector collection name (default: `body_knowledge`)
- `EMBEDDING_MODEL`: Sentence-transformers model (default: `all-MiniLM-L6-v2`)
- `RAG_TOP_K`: Number of retrieved passages (default: `5`)
- `OPIK_API_KEY`: Optional Opik key for tracing

See `.env.example` for full list and defaults.

---

## API reference

- Health: `GET http://localhost:8000/api/v1/health` → `{ "status":"ok", "service":"PhiloAgents" }`
- Chat (WebSocket): `ws://localhost:8000/api/v1/ws/chat/{philosopher_id}/{session_id}`

Example WebSocket usage (JS snippet):

```js
const ws = new WebSocket('ws://localhost:8000/api/v1/ws/chat/brain/session-123');
ws.onopen = () => ws.send('Hello, Brain!');
ws.onmessage = (ev) => console.log('token chunk:', ev.data);
```

---

## Personas

Persona JSON files live in `philoagents/configs/personas/` and define the system prompt and teaching style for each NPC (brain, heart, lungs, bones, digestive_system).

---

## Project structure (overview)

Top-level folders:

- `philoagents/backend/` — FastAPI backend, agents, rag, memory helpers
- `philoagents/frontend/` — Phaser.js demo and chat UI
- `philoagents/data-pipeline/` — Scraper, chunker, embeddings pipeline
- `philoagents/configs/personas/` — Persona JSON files used to build system prompts

---

## Contributing

Contributions are welcome. Good first steps:

1. Open an issue describing the feature or bug
2. Create a branch, implement a focused change, and open a PR
3. Keep changes small and document new environment vars or steps in this README

---

## License

No license file included in the repository. Add a `LICENSE` if you intend to open-source this project.

---

If you'd like, I can:

- Commit this README update and open a PR
- Add a minimal `LICENSE` file (e.g. MIT)
- Run a quick smoke test (start Docker Compose and confirm endpoints)

Tell me which you'd like next.
