# Design: Phase 3 — LLM Integration

## Technical Approach

A unified `LLMClient` class in the backend abstracts provider differences. The client accepts a provider name, API key (if needed), and optional base URL, then routes all calls through a single `generate()` method. Each provider has its own adapter function that handles SDK-specific details and normalizes the response.

## Architecture Decisions

### Decision: Provider routing via unified client over separate service classes
A single `LLMClient` class with internal routing keeps the API surface minimal. Other services call `client.generate(prompt, model)` regardless of provider. Provider-specific logic is encapsulated in private adapter methods.

### Decision: Per-request API keys over server-side storage
API keys are passed with each request via HTTP headers. They are never stored in the database, environment variables, or on disk. This is a privacy-first design — if a backend is compromised, user API keys are not exposed. Keys live only in the browser's memory (localStorage) and are sent per-request.

### Decision: Ollama uses HTTP API over Python SDK
Ollama provides a simple REST API (`/api/generate`) that doesn't require an SDK. Using direct HTTP calls keeps this dependency-free and consistent with how other providers work (all are ultimately HTTP).

### Decision: OpenRouter uses OpenAI-compatible endpoint
OpenRouter provides an OpenAI-compatible API at `https://openrouter.ai/api/v1`. This means we can reuse the OpenAI SDK with a custom base URL — no separate SDK needed.

### Decision: OMXL uses OpenAI-compatible endpoint
OMXL follows the OpenAI API format, so it also reuses the OpenAI SDK with a user-configurable base URL.

### Decision: Pydantic response models for all LLM output
All LLM responses are validated against Pydantic models before being used. This ensures type safety and makes it easy to add new response shapes as features evolve.

## Data Flow

```
Frontend settings → POST /api/settings/llm → Store key in localStorage (client-side only)
                                                    │
Frontend upload + LLM config → POST /api/process → LLMClient.generate()
    ├── OpenAI  → openai SDK → standardized response
    ├── Anthropic → anthropic SDK → standardized response
    ├── OpenRouter → openai SDK (custom base URL) → standardized response
    ├── Ollama  → httpx to localhost:11434 → standardized response
    └── OMXL    → openai SDK (custom base URL) → standardized response
```

## File Changes

- `backend/app/services/llm.py` (new) — unified LLM client with provider routing
- `backend/app/models.py` (modified) — add LLM settings and response Pydantic models
- `backend/app/routes/settings.py` (new) — LLM settings endpoint (store/retrieve keys per session)
- `backend/app/routes/process.py` (new) — process endpoint that triggers LLM calls
- `backend/pyproject.toml` (modified) — add openai, anthropic SDKs
- `frontend/src/app/settings/page.tsx` (new) — settings page with API key inputs
- `frontend/src/components/settings/ApiKeyForm.tsx` (new) — per-provider API key form
- `frontend/src/lib/api.ts` (modified) — add settings and process endpoints
