# Design: Phase 1 — Foundation & Docker

## Technical Approach

Two containers managed by Docker Compose. Next.js handles the frontend serving and API proxying during development (via `next.config.ts` rewrites). FastAPI serves as the backend API. Both are written in TypeScript/Python respectively with full type safety.

## Architecture Decisions

### Decision: Next.js App Router over Pages Router
Using the App Router (React Server Components) because it's the current recommended approach for Next.js, has better streaming support, and integrates more cleanly with server-side patterns we'll need later.

### Decision: FastAPI over Express/Node
FastAPI provides automatic OpenAPI docs, Pydantic validation out of the box, and async support. It's significantly faster than Express for our use case (heavy JSON processing) and the type safety from Pydantic models aligns well with our structured LLM response patterns.

### Decision: Multi-stage Docker builds for Next.js
Next.js has a large dependency tree. A multi-stage build (install deps → build → production image with only `.next/` and node_modules) keeps the final image small (~200MB vs ~1GB single-stage).

### Decision: Docker Compose over Kubernetes
For a local-first, self-hosted product, Docker Compose is simpler and sufficient. If we later add cloud hosting, Kubernetes can be introduced then. The compose file is the single source of truth for service orchestration.

### Decision: API client in frontend over direct fetch calls
A centralized API client (`frontend/src/lib/api.ts`) provides:
- Single base URL configuration (changes with Docker networking)
- Consistent error handling across the app
- Easy to swap or extend (auth headers, retries) later

## Data Flow

```
User browser → Next.js (:3000) → FastAPI (:8000)
                    │                │
                    └── rewrites ────┘
```

During development, Next.js rewrites `/api/*` requests to the backend container. In Docker Compose, this resolves via service name (`http://backend:8000`).

## File Changes

- `frontend/package.json` (new) — Next.js project config
- `frontend/next.config.ts` (new) — rewrites to backend, Tailwind config
- `frontend/src/app/page.tsx` (new) — basic landing page
- `frontend/src/lib/api.ts` (new) — API client wrapper
- `frontend/Dockerfile` (new) — multi-stage Next.js build
- `backend/pyproject.toml` (new) — Python dependencies (FastAPI, Uvicorn, Pydantic)
- `backend/app/main.py` (new) — FastAPI entry point with health endpoint
- `backend/Dockerfile` (new) — slim Python image
- `docker-compose.yml` (new) — orchestrates both services
- `.gitignore` (new) — standard ignores
