# Proposal: Phase 5 — Interactive Viewer

## Intent

Render the article as an interactive, visually engaging experience. The viewer combines three core features: scroll-triggered section reveals (keeps focus, breaks content into digestible chunks), an interactive concept diagram (React Flow mind map of article relationships), and inline glossary terms (tap to reveal definitions). This is where the user experiences the product's core value.

## Scope

**In scope:**
- Article viewer page (`/article/[id]`) with scroll-triggered section reveals using Motion
- React Flow diagram component for concept map visualization (mind map layout)
- Inline glossary term component with expand/collapse on tap/click
- Section card components with staggered animation timing
- Article layout combining all three visual features into a cohesive experience
- Data fetching from backend to load article content + analysis results

**Out of scope:**
- Font, color palette, and motion toggles (Phase 6 — accessibility)
- Quiz or interactive element generation
- Timeline visualization
- Export/share functionality (future phase)

## Approach

1. Create article viewer page at `/article/[id]` that fetches article content and analysis data
2. Implement `ArticleViewer.tsx` as the main layout container with Motion's `whileInView` for scroll reveals
3. Implement `DiagramView.tsx` wrapping React Flow with custom node components and mind map layout
4. Implement `GlossaryTerm.tsx` as inline expandable terms using AnimatePresence for smooth transitions
5. Implement `SectionCard.tsx` as individual scroll-revealed content blocks with staggered delays
6. Wire everything together: article data → sections rendered as cards + concept diagram + glossary terms

## ADHD/Neurodiversity Consideration

Scroll-triggered reveals prevent the "wall of text" overwhelm by showing content progressively — one section at a time. This creates a reading rhythm that sustains attention. The concept diagram externalizes relationships the brain might struggle to track, giving visual anchors for understanding. Inline glossary terms eliminate the distraction of tab-switching to look up definitions — tap and read, stay in flow.
