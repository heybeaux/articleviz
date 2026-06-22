# Tasks: Phase 4 — Article Analysis Pipeline

## 1. Pydantic Models for Structured Output
- [ ] 1.1 Create `AnalysisResponse` model wrapping all output types
- [ ] 1.2 Create `Section` model (id, heading, content, order)
- [ ] 1.3 Create `ConceptMap` model (nodes: ConceptNode[], edges: ConceptEdge[])
- [ ] 1.4 Create `GlossaryEntry` model (term, definition, context)
- [ ] 1.5 Create `Summary` model (tl_dr, key_takeaways)
- [ ] 1.6 Create `ConceptNode` and `ConceptEdge` models for diagram data

## 2. Visualizer Service — Prompt Engineering
- [ ] 2.1 Create `backend/app/services/visualizer.py` with visualizer class
- [ ] 2.2 Write section breakdown prompt (split article into 2-4 paragraph chunks with headings)
- [ ] 2.3 Write concept map prompt (extract key concepts and their relationships as a mind map)
- [ ] 2.4 Write glossary prompt (extract domain-specific terms with context-aware definitions)
- [ ] 2.5 Write summary prompt (generate TL;DR and key takeaways)
- [ ] 2.6 Wire each prompt to use the LLMClient with Pydantic response models

## 3. Process Endpoint
- [ ] 3.1 Update `backend/app/routes/process.py` to orchestrate visualizer calls
- [ ] 3.2 Accept article content and LLM config in process request
- [ ] 3.3 Run all four visualizer calls and aggregate results into AnalysisResponse
- [ ] 3.4 Return complete analysis with article ID, sections, concept map, glossary, and summary

## 4. Prompt Testing & Iteration
- [ ] 4.1 Test section breakdown prompt with a sample news article (verify chunk quality)
- [ ] 4.2 Test concept map prompt with a technical article (verify node/edge relationships)
- [ ] 4.3 Test glossary prompt with a scientific article (verify definition quality)
- [ ] 4.4 Test summary prompt across multiple article types (verify accuracy and brevity)
- [ ] 4.5 Refine prompts based on test results (iterate until output quality is consistent)

## 5. Verification
- [ ] 5.1 End-to-end: POST article → receive complete structured analysis
- [ ] 5.2 Verify section breakdown produces 4-8 digestible sections for a standard article
- [ ] 5.3 Verify concept map produces coherent node/edge structure (no orphaned nodes)
- [ ] 5.4 Verify glossary terms are relevant to the article's domain
- [ ] 5.5 Verify summary accurately captures the article's main points
