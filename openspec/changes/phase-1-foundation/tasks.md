# Tasks: Phase 1 — Foundation & Docker

## 1. Next.js Frontend Setup
- [x] 1.1 Initialize Next.js project in `frontend/` with TypeScript and App Router
- [x] 1.2 Install Tailwind CSS, `@xyflow/react`, `motion`, and other dependency packages
- [x] 1.3 Create basic page structure in `src/app/` with layout and home page
- [x] 1.4 Configure Tailwind CSS for custom color palette tokens (light theme base)

## 2. FastAPI Backend Setup
- [x] 2.1 Create `backend/` project with `pyproject.toml` (FastAPI, Uvicorn, Pydantic)
- [x] 2.2 Create `backend/app/main.py` with FastAPI app and `/health` endpoint
- [x] 2.3 Add Pydantic models for shared types (ArticleInput, HealthResponse)
- [x] 2.4 Configure CORS middleware to allow `localhost:3000`

## 3. Docker Configuration
- [x] 3.1 Write `frontend/Dockerfile` with multi-stage build (deps → build → production)
- [x] 3.2 Write `backend/Dockerfile` with slim Python image and Uvicorn
- [x] 3.3 Create `docker-compose.yml` with frontend (:3000) and backend (:8000) services
- [x] 3.4 Add health checks to both services in compose file

## 4. API Client Layer
- [x] 4.1 Create `frontend/src/lib/api.ts` with fetch wrapper and base URL from env
- [x] 4.2 Add error handling for network failures and non-2xx responses
- [x] 4.3 Wire API client to work with Docker Compose service names (`http://backend:8000`)

## 5. Verification
- [x] 5.1 Run `docker compose up` and verify both containers start
- [x] 5.2 Verify frontend is accessible at `http://localhost:3000`
- [x] 5.3 Verify backend health check at `http://localhost:8000/health`
- [x] 5.4 Verify frontend can call backend via API client
