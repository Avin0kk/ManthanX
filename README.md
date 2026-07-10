# ManthanX — Multi-Agent AI Research Assistant

ManthanX lets you upload documents and ask questions against them. Instead
of a single LLM call, a team of specialized agents collaborates — one routes
the question, one retrieves relevant document chunks, one verifies whether
that retrieval is actually sufficient, and one synthesizes a final, cited
answer — with the whole process streamed live to the UI as it happens.

Built as a portfolio project to demonstrate backend engineering, RAG
pipelines, multi-agent orchestration, authentication, and full-stack
integration end to end.

## Features

- **Document ingestion** — upload PDF/DOCX/TXT files; they're parsed,
  chunked, embedded locally, and stored in Postgres with pgvector
- **Multi-agent RAG pipeline** — Router, Researcher, Critic, and
  Synthesizer agents built with LangGraph, each with a narrow, well-defined
  responsibility
- **Live streaming** — agent progress streams to the frontend via
  Server-Sent Events, so the UI shows each agent completing in real time
- **Conversation memory** — multi-turn conversations are persisted and
  loaded back with full history
- **Google OAuth login** — JWT-based auth; documents and conversations are
  scoped per user
- **Resilient LLM calls** — automatic retry with backoff on rate limits or
  provider-side errors, with graceful fallback messaging
- **Custom design system** — a from-scratch visual identity (not a UI kit
  default), including a signature "churning" diagram representing the
  four-agent pipeline

## Tech stack

| Layer | Tech |
|---|---|
| Orchestration | LangGraph |
| Backend | FastAPI, Pydantic v2, SQLAlchemy (async) |
| Database | PostgreSQL + pgvector |
| Cache | Redis |
| LLM | Gemini API (gemini-2.5-flash-lite) |
| Embeddings | sentence-transformers (local, free) |
| Auth | Google OAuth 2.0 + JWT |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Deploy target | Docker Compose (local); Render/Vercel-ready |

## Architecture

1. User signs in with Google → backend issues a JWT
2. User uploads a document → parsed, chunked, embedded, stored in pgvector,
   scoped to that user
3. User asks a question → **Router agent** decides whether it needs
   document search or can be answered directly
4. **Researcher agent** retrieves the most relevant chunks from that user's
   documents via cosine similarity search
5. **Critic agent** independently assesses whether the retrieved chunks are
   actually sufficient to answer the question — and says so explicitly if
   they aren't
6. **Synthesizer agent** writes the final answer, grounded in the retrieved
   content and citing source documents
7. Each step streams to the frontend as it completes; the full exchange is
   saved so the conversation can be resumed later

## Run it locally

**Prerequisites:** Docker Desktop, Node.js, and a free
[Google AI Studio](https://aistudio.google.com) API key.

### Backend

1. Copy the env template and fill in real values:
cp backend/.env.example backend/.env
   You'll need:
   - `SECRET_KEY` / `JWT_SECRET_KEY` — any random strings
   - `GEMINI_API_KEY` — from Google AI Studio
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from a Google Cloud
     OAuth client (Web application type), with
     `http://localhost:8000/auth/google/callback` as an authorized
     redirect URI

2. Start the backend stack:
docker compose up --build

3. Confirm it's alive:
curl http://localhost:8000/health

4. Interactive API docs: http://localhost:8000/docs

### Frontend
cd frontend
npm install
npm run dev

Visit http://localhost:3000, sign in with Google, upload a document, and
start asking questions.

## Project layout
backend/
├── Dockerfile
├── requirements.txt
├── .env.example
└── app/
├── main.py              FastAPI entrypoint
├── core/config.py       env-driven settings
├── db/
│   ├── session.py       async SQLAlchemy engine/session
│   └── models.py        User, Document, Chunk, Conversation, Message
├── services/
│   ├── file_parsing.py  PDF/DOCX/TXT text extraction
│   ├── chunking.py      overlapping text splitter
│   ├── embeddings.py    local sentence-transformers embedding
│   ├── ingestion.py     orchestrates parse → chunk → embed → store
│   ├── retrieval.py     pgvector cosine similarity search
│   ├── llm.py           Gemini wrapper with retry/backoff
│   ├── auth.py          JWT issuing/verification, user lookup
│   └── conversations.py conversation + message persistence
├── agents/
│   ├── state.py         shared LangGraph state definition
│   ├── router.py        decides retrieve vs. direct
│   ├── researcher.py    pulls relevant chunks
│   ├── critic.py        assesses retrieval sufficiency
│   ├── synthesizer.py   writes the final cited answer
│   └── graph.py         wires all four agents into a pipeline
└── api/
├── documents.py     upload/list/search/delete
├── chat.py          SSE-streamed multi-agent chat endpoint
├── conversations.py conversation history endpoints
├── auth.py          Google OAuth login/callback
└── deps.py          shared auth dependency
frontend/
├── app/
│   ├── page.tsx             landing page
│   ├── chat/page.tsx        main chat interface
│   └── auth/callback/       OAuth token handoff
├── components/
│   ├── ChatPanel.tsx            streaming chat UI
│   ├── AgentActivityPanel.tsx   live agent status indicators
│   ├── ConversationSidebar.tsx  history list
│   ├── DocumentPanel.tsx        upload/list/delete documents
│   └── Header.tsx               nav + auth state
└── lib/
├── api.ts                backend URL config
└── auth.ts               token storage helpers

<!-- ## Design notes (talking points)

- **Async throughout** — FastAPI + SQLAlchemy's async engine, so ingestion,
  retrieval, and agent calls never block the event loop.
- **Local embeddings for dev velocity** — `sentence-transformers` runs
  free and offline. The embedding interface is isolated in one module, so
  swapping to a hosted embeddings API later is a one-file change.
- **Four narrow agents instead of one big prompt** — each agent has a
  single, explicit responsibility. The Critic in particular exists to catch
  a well-known RAG failure mode: confidently answering from irrelevant
  retrieved content. Keeping verification separate from generation is what
  makes the Synthesizer's answers meaningfully more grounded.
- **Ownership checks return 404, not 403** — when a user requests a
  document or conversation they don't own, the API returns "not found"
  rather than "forbidden," so it doesn't leak whether the resource exists
  under someone else's account.
- **Retry with backoff on LLM calls** — free-tier rate limits and
  provider-side outages are real, not hypothetical. Transient failures are
  retried automatically before falling back to an honest error message. -->

<!-- ## Possible future improvements

- Re-ranking retrieved chunks with a cross-encoder for better precision
- Streaming token-by-token generation from the Synthesizer, not just
  agent-level progress
- Swapping local embeddings for a hosted model (e.g. Voyage AI) in
  production
- Alembic-based migrations instead of `create_all` on startup
- Deployment to Render (backend) and Vercel (frontend) -->