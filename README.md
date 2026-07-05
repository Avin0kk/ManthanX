# ManthanX — Multi-Agent AI Research Assistant

ManthanX is a multi-agent AI system that lets you upload documents and ask
questions against them. Instead of a single LLM call, a team of specialized
agents collaborates — one plans the approach, one retrieves relevant
information, one verifies claims against sources, and one synthesizes the
final cited answer — with the whole process streamed live to the UI.

Built as a portfolio project to demonstrate backend engineering, RAG
pipelines, and multi-agent orchestration alongside traditional full-stack
work.

## Status: Phase 1 (in progress)

Currently building the foundational backend: FastAPI skeleton, async
Postgres + pgvector setup, and the document ingestion pipeline
(PDF/DOCX/TXT → chunk → embed → store). No agents yet — that's Phase 2.

## Tech Stack

| Layer | Tech |
|---|---|
| Orchestration | LangGraph |
| Backend | FastAPI, Pydantic v2, SQLAlchemy (async) |
| Database | PostgreSQL + pgvector |
| Cache/Queue | Redis, Celery |
| LLM | Gemini API (gemini-2.5-flash) |
| Embeddings | sentence-transformers (local, free) |
| Frontend | Next.js 16, Tailwind, SSE streaming |
| Deploy | Docker, Render, Vercel |

## Architecture (planned)

1. User uploads a document → chunked → embedded → stored in pgvector
2. User asks a question → **Router agent** decides the approach
3. **Researcher agent** retrieves relevant chunks (+ web search if needed)
4. **Critic agent** checks claims against retrieved sources
5. **Synthesizer agent** writes the final answer with citations
6. Frontend streams each agent's progress live

## Run it locally

**Prerequisites:** Docker Desktop installed and running.

1. Copy the env template and fill in your own values:
cp backend/.env.example backend/.env
  Edit `backend/.env`:
   - `SECRET_KEY` — any random string
   - `GEMINI_API_KEY` — get a free key at [aistudio.google.com](https://aistudio.google.com)

2. Start everything:
docker compose up --build

3. Check it's alive:
curl http://localhost:8000/health

4. Interactive API docs: http://localhost:8000/docs

## Project layout
backend/
├── Dockerfile
├── requirements.txt
├── .env.example
└── app/
├── main.py          FastAPI entrypoint
├── core/            app configuration
├── db/              database models and session
├── services/        business logic (parsing, chunking, embedding)
├── schemas/         Pydantic request/response models
├── api/             route handlers
├── agents/          LangGraph agents (Phase 2)
└── tools/           agent tools (Phase 2)

## Roadmap

- [x] Project scaffolding, Docker setup, environment config
- [ ] FastAPI app + async DB connection
- [ ] Document ingestion pipeline (parse → chunk → embed → store)
- [ ] LangGraph multi-agent pipeline (Router → Researcher → Critic → Synthesizer)
- [ ] `/chat` endpoint with SSE streaming
- [ ] Next.js frontend with live agent activity panel
- [ ] Deployment (Render + Vercel)