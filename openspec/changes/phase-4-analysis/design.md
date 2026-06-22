# Design: Phase 4 — Article Analysis Pipeline

## Technical Approach

The visualizer service sends the article content to the LLM through four prompt templates, each designed to produce structured JSON output. Pydantic response models enforce the shape of each output, causing the LLM to conform to a predictable format.

## Architecture Decisions

### Decision: Four separate LLM calls over a single call
Using four separate LLM calls (one per output type) produces higher-quality results than cramming everything into one prompt. Each call has a focused, well-tested prompt. The trade-off is more API calls and slightly longer processing time — but quality matters more for the core product experience.

### Decision: Pydantic response models over regex parsing
LLM responses are validated against strict Pydantic models (`response_model` parameter). This forces the LLM to output conforming JSON and eliminates fragile regex parsing. If the model's output doesn't match, we get a clear validation error instead of garbled data.

### Decision: Section breakdown targets 2-4 paragraph chunks
ADHD-friendly content should be digestible. Sections of 2-4 paragraphs create natural reading units — long enough to convey meaning, short enough to feel achievable. The prompt explicitly instructs the LLM to respect this constraint.

### Decision: Concept map uses mind-map topology
React Flow has a built-in mind map layout tutorial. The concept map output is structured as a directed graph with a central root node (article topic) and branching sub-concepts. This matches how ADHD brains often think — associatively, from a central idea outward.

### Decision: Glossary terms extracted with context-aware definitions
Rather than generic dictionary definitions, glossary terms are defined using their context within the article. This makes definitions immediately relevant and reduces cognitive overhead of cross-referencing external sources.

## Data Flow

```
POST /api/process → Article content + LLM config
    │
    ├── Call 1: Section Breakdown Prompt → Pydantic model (Section[])
    │   └── [{ id, heading, content, order }]
    │
    ├── Call 2: Concept Map Prompt → Pydantic model (ConceptMap)
    │   └── { nodes: [{ id, label, category }], edges: [{ from, to, label }] }
    │
    ├── Call 3: Glossary Prompt → Pydantic model (GlossaryEntry[])
    │   └── [{ term, definition, context }]
    │
    └── Call 4: Summary Prompt → Pydantic model (Summary)
        └── { tl_dr, key_takeaways: string[] }
```

## File Changes

- `backend/app/services/visualizer.py` (new) — four LLM prompt functions + orchestration
- `backend/app/models.py` (modified) — add AnalysisResponse, Section, ConceptMap, GlossaryEntry, Summary models
- `backend/app/routes/process.py` (modified) — wire visualizer calls into process endpoint
- `backend/pyproject.toml` (no changes needed — already has dependencies from Phase 3)
