# BodyAgents (formerly PhiloAgents) – Agentic RAG Educational NPC Engine

> A production-grade AI system that transforms static game NPCs into intelligent, memory-driven conversational agents powered by Agentic RAG, dual-memory architecture, and real-time LLM streaming.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Data Pipeline](#data-pipeline)
7. [Configuration](#configuration)
8. [LLMOps & Observability](#llmops--observability)
9. [Roadmap](#roadmap)

---

## Overview

BodyAgents replaces scripted game NPCs with intelligent educational body-part characters that can:

- **Reason** about questions using an LLM (Groq)
- **Retrieve** relevant knowledge via MongoDB vector search (Agentic RAG)
- **Remember** conversation history using a dual-memory system
- **Stream** responses token-by-token in real time over WebSocket

Players interact with body-part NPCs (Brain, Heart, Lungs, Bones, Digestive System) inside a Phaser.js browser game.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PhiloAgents System                               │
│                                                                         │
│  ┌──────────────┐   WebSocket    ┌─────────────────────────────────┐   │
│  │  Phaser.js   │◄──────────────►│         FastAPI Backend          │   │
│  │  Frontend    │  token stream  │                                  │   │
│  └──────────────┘                │  ┌─────────────┐                │   │
│                                  │  │  LangGraph  │                │   │
│                                  │  │    Agent    │                │   │
│                                  │  │             │                │   │
│                                  │  │  ┌────────┐ │   Groq API    │   │
│                                  │  │  │  LLM   │◄├───────────────┤   │
│                                  │  │  └────────┘ │               │   │
│                                  │  │      │      │               │   │
│                                  │  │  ┌───▼────┐ │               │   │
│                                  │  │  │ Tool:  │ │               │   │
│                                  │  │  │ Retriev│ │               │   │
│                                  │  │  └───┬────┘ │               │   │
│                                  │  └──────┼──────┘               │   │
│                                  │         │                        │   │
│                                  │  ┌──────▼──────────────────┐   │   │
│                                  │  │     MongoDB Atlas         │   │   │
│                                  │  │  ┌─────────┐ ┌────────┐ │   │   │
│                                  │  │  │ Short-  │ │ Long-  │ │   │   │
│                                  │  │  │ term    │ │ term   │ │   │   │
│                                  │  │  │ (conv.) │ │(vector)│ │   │   │
│                                  │  │  └─────────┘ └────────┘ │   │   │
│                                  │  └──────────────────────────┘   │   │
│                                  └─────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Offline Data Pipeline                          │  │
│  │  Scraper → Chunker → Embeddings → MongoDB Vector Store           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Observability: Opik traces every LLM call and RAG retrieval            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Online Pipeline (request flow)

1. Player sends a message to an NPC in the Phaser frontend
2. FastAPI receives the WebSocket message
3. Short-term memory (conversation history) is loaded from MongoDB
4. LangGraph agent decides whether to invoke the retrieval tool
5. Retrieval tool runs a MongoDB Atlas vector search (long-term memory)
6. Final prompt = persona card + conversation history + retrieved context + user query
7. Groq LLM generates a response, streamed token-by-token
8. Tokens are forwarded to the frontend via WebSocket
9. Full response is stored back in MongoDB
10. Opik logs the full trace for monitoring and evaluation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11) |
| Agent Orchestration | LangGraph |
| LLM API | Groq (llama3-70b-8192) |
| Database | MongoDB Atlas |
| Vector Search | MongoDB Atlas Vector Search |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 |
| Frontend | Phaser.js 3 |
| Communication | WebSockets |
| LLMOps | Opik |
| Containerisation | Docker + Docker Compose |

---

## Project Structure

```
philoagents/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── routes/
│   │   │   ├── health.py        # Health check endpoint
│   │   │   └── chat.py          # WebSocket chat endpoint
│   │   ├── agents/
│   │   │   ├── philosopher_agent.py  # LangGraph agent
│   │   │   ├── state.py              # AgentState TypedDict
│   │   │   └── tools.py              # Retrieval tool
│   │   ├── memory/
│   │   │   └── mongodb.py       # Short-term memory (MongoDB)
│   │   ├── rag/
│   │   │   ├── retriever.py     # Vector search retrieval
│   │   │   └── embeddings.py    # Embedding utilities
│   │   ├── websocket/
│   │   │   └── manager.py       # WebSocket connection manager
│   │   ├── configs/
│   │   │   └── personas.py      # Persona loader
│   │   └── utils/
│   │       └── opik_tracer.py   # Opik observability integration
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── index.html           # HTML shell with chat UI overlay
│   │   ├── main.js              # Phaser game initialisation
│   │   ├── scenes/
│   │   │   ├── PreloadScene.js  # Asset loading scene
│   │   │   └── GameScene.js     # Main world + NPC interaction
│   │   └── ui/
│   │       └── ChatManager.js   # WebSocket + DOM chat handler
│   ├── package.json
│   └── webpack.config.js
│
├── data-pipeline/
│   ├── scraper/
│   │   └── scraper.py           # Educational anatomy content scraper
│   ├── chunking/
│   │   └── chunker.py           # Text cleaning + chunking
│   ├── embeddings/
│   │   └── embed_and_store.py   # Embed chunks + upsert to MongoDB
│   ├── eval/
│   │   └── eval_generator.py    # Evaluation dataset generator
│   └── requirements.txt
│
├── configs/
│   ├── personas/                # Body-part educational persona JSON files
│   │   ├── brain.json
│   │   ├── heart.json
│   │   ├── lungs.json
│   │   ├── bones.json
│   │   └── digestive_system.json
│   └── prompts/
│       └── system_prompt_template.py
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- MongoDB Atlas cluster with Vector Search enabled
- Groq API key

### 1. Clone and configure

```bash
git clone https://github.com/PraveenMudalgeri/philoagents-agentic-rag.git
cd philoagents-agentic-rag
cp .env.example .env
# Edit .env with your credentials
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

### 3. Run the data pipeline (one-time setup)

```bash
cd philoagents/data-pipeline
pip install -r requirements.txt

# Step 1: Scrape
python scraper/scraper.py

# Step 2: Chunk
python chunking/chunker.py

# Step 3: Embed and store in MongoDB
python embeddings/embed_and_store.py
```

Then create a **Vector Search Index** in MongoDB Atlas on the `body_knowledge` collection:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "philosopher_id"
    }
  ]
}
```

---

## Data Pipeline

```
Educational anatomy sources
      │
      ▼
  scraper.py          → raw_docs.json
      │
      ▼
  chunker.py          → chunks.json
      │
      ▼
embed_and_store.py    → MongoDB Atlas (vector store)
      │
      ▼
eval_generator.py     → eval_dataset.json
```

---

## Configuration

All runtime configuration is via environment variables. See [.env.example](.env.example) for the full list.

Key variables:

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Groq LLM API key | – |
| `GROQ_MODEL` | Groq model name | `llama3-70b-8192` |
| `MONGODB_URI` | MongoDB Atlas connection string | – |
| `MONGODB_DB` | Database name | `philoagents` |
| `EMBEDDING_MODEL` | Sentence-transformer model | `all-MiniLM-L6-v2` |
| `RAG_TOP_K` | Number of retrieved passages | `5` |
| `OPIK_API_KEY` | Opik API key (optional) | – |

Body-part educational personas are configured as JSON files under `philoagents/configs/personas/`.

---

## LLMOps & Observability

PhiloAgents integrates with [Opik](https://www.comet.com/site/products/opik/) for:

- LLM call tracing
- RAG retrieval logging
- Evaluation dataset management
- Cost and latency monitoring

Set `OPIK_API_KEY` in `.env` to enable tracing. When not set, the system falls back to a no-op tracer transparently.

---

## Roadmap

- [ ] Tilemap-based game world (Tiled editor)
- [ ] Animated character sprites
- [ ] Player authentication + persistent sessions
- [ ] Multi-turn evaluation with Opik
- [ ] Additional body-part NPCs and learning modules
- [ ] Voice synthesis (TTS streaming)
- [ ] Deployment on AWS / GCP
