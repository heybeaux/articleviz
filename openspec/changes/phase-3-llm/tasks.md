# Tasks: Phase 3 — LLM Integration

## 1. Backend LLM Service
- [ ] 1.1 Create `backend/app/services/llm.py` with unified LLMClient class
- [ ] 1.2 Implement OpenAI adapter (openai SDK, supports GPT-4o and o-series models)
- [ ] 1.3 Implement Anthropic adapter (anthropic SDK, Claude models)
- [ ] 1.4 Implement OpenRouter adapter (openai SDK with custom base URL)
- [ ] 1.5 Implement Ollama adapter (httpx to localhost:11434/api/generate)
- [ ] 1.6 Implement OMXL adapter (openai SDK with user-configurable base URL)
- [ ] 1.7 Create standardized LLMResponse Pydantic model

## 2. Settings Route
- [ ] 2.1 Create `backend/app/routes/settings.py` with LLM settings endpoints
- [ ] 2.2 Implement POST /api/settings/llm to store provider key and config (session-based)
- [ ] 2.3 Implement GET /api/settings/llm to retrieve current provider config
- [ ] 2.4 Implement DELETE /api/settings/llm to clear stored keys

## 3. Process Route
- [ ] 3.1 Create `backend/app/routes/process.py` with /api/process endpoint
- [ ] 3.2 Wire process route to use LLMClient with user's configured provider
- [ ] 3.3 Add request validation for article content and LLM config

## 4. Frontend Settings UI
- [ ] 4.1 Create `frontend/src/app/settings/page.tsx` — settings page layout
- [ ] 4.2 Create `frontend/src/components/settings/ApiKeyForm.tsx` — provider selection + key input
- [ ] 4.3 Implement provider selector (dropdown with descriptions for each provider)
- [ ] 4.4 Implement API key input field (password-masked, with show/hide toggle)
- [ ] 4.5 Implement Ollama detection (auto-detect if localhost:11434 is reachable)
- [ ] 4.6 Implement OMXL base URL input field (shown when OMXL is selected)
- [ ] 4.7 Wire settings form to backend /api/settings/llm endpoints

## 5. API Key Storage (Client-Side Only)
- [ ] 5.1 Store API keys in browser localStorage (never sent to server for persistence)
- [ ] 5.2 Load saved keys on settings page mount
- [ ] 5.3 Include API key in request headers when calling backend endpoints

## 6. Verification
- [ ] 6.1 Test OpenAI provider with a valid API key (test prompt returns response)
- [ ] 6.2 Test Anthropic provider with a valid API key (test prompt returns response)
- [ ] 6.3 Test OpenRouter provider with a valid API key (test prompt returns response)
- [ ] 6.4 Test Ollama auto-detection (detects local Ollama instance)
- [ ] 6.5 Test OMXL provider with custom base URL (test prompt returns response)
- [ ] 6.6 Test that API keys are never stored in the database or on disk
