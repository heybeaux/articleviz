# Tasks: Phase 5 — Interactive Viewer

## 1. Article Viewer Page
- [ ] 1.1 Create `frontend/src/app/article/[id]/page.tsx` — article viewer route
- [ ] 1.2 Fetch article content and analysis data from backend on page load
- [ ] 1.3 Display loading state while data is being fetched
- [ ] 1.4 Handle error states (fetch failures, missing article data)

## 2. Main Layout — ArticleViewer
- [ ] 2.1 Create `frontend/src/components/viewer/ArticleViewer.tsx` — layout container
- [ ] 2.2 Add Motion wrapper with `whileInView` for scroll-triggered reveals
- [ ] 2.3 Display TL;DR summary at the top of the article
- [ ] 2.4 Render section cards in order with staggered animation delays
- [ ] 2.5 Include concept diagram component between first and second sections

## 3. Section Cards — SectionCard
- [ ] 3.1 Create `frontend/src/components/viewer/SectionCard.tsx` — individual content block
- [ ] 3.2 Implement scroll-triggered fade-in + slide-up animation (Motion `whileInView`)
- [ ] 3.3 Render section heading and paragraph content
- [ ] 3.4 Wrap glossary terms inline with `<GlossaryTerm>` component
- [ ] 3.5 Add subtle hover state for interactive feel

## 4. Concept Diagram — DiagramView
- [ ] 4.1 Create `frontend/src/components/viewer/DiagramView.tsx` — React Flow wrapper
- [ ] 4.2 Initialize React Flow with concept map nodes and edges from analysis data
- [ ] 4.3 Apply mind map layout (React Flow's built-in mindmap layout)
- [ ] 4.4 Add zoom/pan controls for diagram exploration
- [ ] 4.5 Style nodes with category-based colors and readable labels

## 5. Glossary Terms — GlossaryTerm
- [ ] 5.1 Create `frontend/src/components/viewer/GlossaryTerm.tsx` — inline expandable term
- [ ] 5.2 Implement tap/click toggle to show/hide definition
- [ ] 5.3 Add AnimatePresence for smooth expand/collapse animation
- [ ] 5.4 Style term trigger with subtle underline to indicate interactivity
- [ ] 5.5 Ensure keyboard accessibility (Enter/Space to toggle, Escape to close)

## 6. Data Integration
- [ ] 6.1 Wire section cards to render actual article content from analysis data
- [ ] 6.2 Wire diagram component to render concept map nodes/edges from analysis data
- [ ] 6.3 Wire glossary terms to replace matching terms in article text with interactive components
- [ ] 6.4 Test end-to-end: upload article → process → view interactive result

## 7. Verification
- [ ] 7.1 Verify sections reveal on scroll with staggered timing
- [ ] 7.2 Verify concept diagram renders and is interactive (zoom, pan, click nodes)
- [ ] 7.3 Verify glossary terms expand/collapse on tap (mobile) and click (desktop)
- [ ] 7.4 Verify article viewer works with articles of varying lengths (short, medium, long)
