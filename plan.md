# ArticleViz — Project Plan

## Overview

ArticleViz transforms uploaded articles into beautiful, interactive websites that help explain content through visual and interactive approaches. Designed specifically for ADHD and neurodiverse users, it makes news articles, educational content, and other materials more engaging.

## Architecture

```
┌─────────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   User's Browser     │────────▶│  Next.js Frontend │────────▶│ FastAPI Backend│
│   (interactive site) │◀────────│  :3000           │◀────────│  :8000        │
└─────────────────────┘         └──────────────────┘         └──────┬───────┘
                                                                    │
                                                          ┌─────────▼─────────┐
                                                          │  User's LLM API   │
                                                          │ (OpenAI/Anthropic/│
                                                          │  OpenRouter/Ollama│
                                                          │       /OMXL)      │
                                                          └───────────────────┘
```

Docker Compose wires frontend + backend together. One `docker compose up` and it runs locally.

## Library Choices

| Purpose | Library | Why |
|---|---|---|
| Diagrams | `@xyflow/react` (React Flow v12) | First-class Next.js support, custom React nodes for animations, built-in mind map tutorial |
| Scroll/animation | `motion/react` (Motion) | Formerly Framer Motion, `whileInView` for scroll reveals, built-in reduced motion support |
| Glossary | Custom `<GlossaryTerm>` component | Inline expand/collapse > hover tooltips (touch-friendly, keyboard accessible) |
| Fonts | Lexend + Atkinson Hyperlegible via Google Fonts | User toggle, CSS custom properties on `<html>` |
| PDF parsing | PyMuPDF (fitz) | Fast, reliable |
| DOCX parsing | python-docx | Standard library for .docx |

## OpenSpec Structure

Changes are organized per phase, implemented sequentially:

```
openspec/changes/
├── phase-1-foundation/      # Docker, project init, API layer
├── phase-2-ingestion/       # Article upload (text, URL, PDF, DOCX)
├── phase-3-llm/             # LLM abstraction + provider integration
├── phase-4-analysis/        # Article analysis pipeline
├── phase-5-viewer/          # Interactive article viewer
└── phase-6-accessibility/   # Fonts, colorblind palettes, reduced motion
```

## Phases

### Phase 1: Foundation & Docker
- Initialize Next.js (App Router, TypeScript) + FastAPI projects
- Create `docker-compose.yml` with frontend (:3000), backend (:8000), health checks
- Set up API client layer in frontend to backend
- **Deliverable:** Both services run via `docker compose up`, health check passes

### Phase 2: Article Ingestion
- **Backend:** Routes for text paste, URL fetch (httpx + bs4), PDF upload (PyMuPDF), DOCX upload (python-docx)
- **Backend:** Content normalization pipeline (strip HTML, extract text, clean whitespace)
- **Frontend:** Upload page with tabbed input (Text / URL / PDF / DOCX), drag-drop zone, file validation
- **Deliverable:** User can submit an article in any format, backend returns cleaned text

### Phase 3: LLM Integration
- **Backend:** `llm.py` abstraction layer with provider routing (OpenAI, Anthropic, OpenRouter, Ollama, OMXL)
- **Backend:** Pydantic models for structured LLM responses (diagram data, glossary terms, section breakdown)
- **Frontend:** Settings page with per-provider API key inputs, validation
- **Deliverable:** User configures their LLM, backend calls it and returns structured data

### Phase 4: Article Analysis Pipeline
- **Backend:** `visualizer.py` sends article to LLM with prompts that return:
  - **Section breakdown** — content split into digestible chunks with headings
  - **Concept map data** — nodes (key concepts) + edges (relationships) for React Flow
  - **Glossary terms** — key terms with definitions extracted from context
  - **Summary/overview** — TL;DR at top of article
- **Deliverable:** LLM returns structured JSON that frontend can render

### Phase 5: Interactive Viewer
- **Frontend:** `ArticleViewer.tsx` — main layout with scroll-triggered section reveals
- **Frontend:** `DiagramView.tsx` — React Flow diagram of concepts/relationships
- **Frontend:** `GlossaryTerm.tsx` — inline expandable definitions on key terms
- **Frontend:** `SectionCard.tsx` — individual content blocks with staggered animations
- **Deliverable:** User sees their article as an interactive, scroll-animated experience

### Phase 6: Accessibility
- **Frontend:** Font toggle (Inter → Lexend → Atkinson Hyperlegible) via CSS custom properties
- **Frontend:** Colorblind palette switcher (protanopia, deuteranopia, tritanopia-safe palettes)
- **Frontend:** Motion toggle (respects `prefers-reduced-motion` OS setting by default)
- **Frontend:** All interactive elements keyboard-navigable, ARIA labels on React Flow nodes
- **Deliverable:** Full accessibility suite active

## Key Technical Decisions

1. **LLM prompts are the product.** The quality of diagrams, glossary terms, and section breakdowns depends on well-crafted prompts. These will be iterated during Phase 4 implementation.

2. **Structured LLM responses via Pydantic.** `response_model` in the LLM calls forces JSON output matching our schemas — no parsing hacks.

3. **Ollama support is important.** Many users want local inference. Ollama runs locally with no API key needed — auto-detected on `localhost:11434`.

4. **Article data stored in-memory for MVP.** No database yet — article content + generated data lives in FastAPI state. SQLite/Postgres can be added later if persistence is needed.

5. **CSS custom properties for all theming.** Font, color palette, and motion settings are CSS variables on `<html>`, toggled via a single React context. Zero re-renders needed for theme switches.

## Open Workflow

- Fluid not rigid — no phase gates, work on what makes sense
- Iterative not waterfall — learn as you build, refine as you go
- Easy not complex — lightweight setup, minimal ceremony
- Brownfield-first — works with existing codebases
