# Proposal: Phase 1 — Foundation & Docker

## Intent

Establish the project's technical foundation: both services running behind Docker Compose with a working API client layer. This is the prerequisite for all subsequent phases — nothing else can proceed until we have a running, communicating frontend and backend.

## Scope

**In scope:**
- Next.js project initialized with App Router and TypeScript
- FastAPI project initialized with Python/Pydantic
- Dockerfile for frontend (Next.js)
- Dockerfile for backend (FastAPI + Python)
- `docker-compose.yml` wiring both services together
- Health check endpoints on both services
- API client layer in frontend → backend (fetch wrapper)
- CORS configuration for local development

**Out of scope:**
- Article ingestion or processing logic (Phase 2)
- LLM integration (Phase 3)
- Any UI components beyond a basic health check page

## Approach

1. Initialize Next.js project in `frontend/` with TypeScript, Tailwind CSS, and App Router
2. Initialize FastAPI project in `backend/` with Pydantic models and Uvicorn
3. Write Dockerfiles for both services (multi-stage build for Next.js, slim Python image for backend)
4. Create `docker-compose.yml` with frontend (:3000), backend (:8000), and health checks
5. Build a lightweight API client in `frontend/src/lib/api.ts` wrapping fetch with backend base URL
6. Configure CORS on the FastAPI side to allow `localhost:3000`

## ADHD/Neurodiversity Consideration

A clean, well-structured foundation reduces cognitive load for the development team. Docker Compose means anyone can run the full stack with one command — no "works on my machine" friction. This mirrors the product philosophy: make things accessible and easy from day one.
