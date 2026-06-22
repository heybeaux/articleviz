# Proposal: Phase 4 — Article Analysis Pipeline

## Intent

Analyze the ingested article using the user's configured LLM to generate structured data for visualizations. The analysis produces four outputs: section breakdown, concept map (for React Flow diagrams), glossary terms with definitions, and a TL;DR summary. This is where the product's core value is created — transforming raw text into an interactive learning experience.

## Scope

**In scope:**
- Visualizer service (`visualizer.py`) with LLM prompt engineering
- Section breakdown generation (split article into digestible chunks)
- Concept map generation (key concepts as nodes, relationships as edges for React Flow)
- Glossary term extraction (key terms with context-aware definitions)
- TL;DR summary generation
- Pydantic models for all structured outputs
- Process endpoint that orchestrates the analysis pipeline

**Out of scope:**
- Interactive diagram rendering (Phase 5 — that's the frontend viewer)
- Quiz or interactive element generation (future phase)
- Timeline visualization (future phase)
- Image or chart generation from article content

## Approach

1. Backend creates `services/visualizer.py` that sends the article to the LLM with carefully crafted prompts
2. Four separate LLM calls (or a single call with structured output) generate:
   - **Section breakdown:** Article split into thematic chunks with headings, each 2-4 paragraphs
   - **Concept map:** Key concepts identified and their relationships mapped as nodes + edges
   - **Glossary terms:** Domain-specific terms extracted with definitions from context
   - **Summary:** A concise TL;DR for the top of the article
3. All outputs use Pydantic models to enforce JSON structure (LLM forced to conform)
4. The `/api/process` endpoint orchestrates these calls and returns the complete analysis

## ADHD/Neurodiversity Consideration

This is the heart of the product. Long walls of text overwhelm ADHD readers — section breaks create natural stopping points and reduce cognitive load. Concept maps externalize relationships that neurodiverse readers might struggle to hold in working memory. Inline glossary terms prevent the "I'll look that up later" distraction loop by making definitions available with a single tap.
