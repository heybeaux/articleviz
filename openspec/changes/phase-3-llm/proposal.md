# Proposal: Phase 3 — LLM Integration

## Intent

Connect the backend to LLM APIs through a unified abstraction layer. Users provide their own API keys — no keys are stored server-side or shared across users. This supports five providers: OpenAI, Anthropic, OpenRouter, Ollama (local), and OMXL.

## Scope

**In scope:**
- LLM abstraction service (`llm.py`) with provider routing
- Provider adapters for OpenAI, Anthropic, OpenRouter, Ollama, OMXL
- Pydantic models for structured LLM responses
- Settings route for API key management (session-based, not persisted)
- Frontend settings page with per-provider API key inputs
- Ollama auto-detection (no API key needed for local inference)

**Out of scope:**
- Article analysis prompts (Phase 4 — that's the visualizer service)
- Model selection UI (MVP uses a sensible default per provider)
- API key persistence to database or file system
- Rate limiting or usage tracking

## Approach

1. Backend creates `services/llm.py` — a unified LLM client that routes to the correct provider based on user selection
2. Each provider has its own adapter function using the appropriate SDK:
   - **OpenAI:** `openai` Python SDK (supports GPT-4o, o-series models)
   - **Anthropic:** `anthropic` Python SDK (Claude models)
   - **OpenRouter:** OpenAI-compatible endpoint at `https://openrouter.ai/api/v1`
   - **Ollama:** HTTP calls to `http://localhost:11434/api/generate`
   - **OMXL:** OpenAI-compatible endpoint (user-configurable URL)
3. All providers return a standardized `LLMResponse` Pydantic model (content, usage stats)
4. API keys are passed per-request via headers — never stored in the database or on disk
5. Frontend settings page lets users configure their provider and key

## ADHD/Neurodiversity Consideration

User-provided API keys mean zero cost barrier to entry — users control their own spending. Ollama support means fully local, free inference is an option. Clear settings UI with provider descriptions helps users choose without decision paralysis (a common ADHD challenge).
