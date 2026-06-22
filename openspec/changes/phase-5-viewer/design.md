# Design: Phase 5 — Interactive Viewer

## Technical Approach

The article viewer is a Next.js page that fetches analysis data from the backend and renders it through three component families: scroll-revealed section cards, a React Flow diagram, and inline glossary terms. Motion handles all scroll-triggered animations with `whileInView` and staggered children.

## Architecture Decisions

### Decision: Motion's whileInView over Intersection Observer API directly
Motion provides `whileInView` as a declarative prop on `<motion.div>`, which is cleaner than writing custom Intersection Observer hooks. It also integrates with the reduced motion system from Phase 6 (via `MotionConfig`).

### Decision: React Flow mind map layout over custom force-directed graph
React Flow has a built-in mind map tutorial and layout algorithm. Using it directly saves significant engineering time and produces clean, readable diagrams out of the box. Custom nodes (React components) can still be used for styled glossary terms within the diagram if needed.

### Decision: Inline expand/collapse over hover tooltips for glossary
Hover-based tooltips are unreliable on touch devices (no hover state on mobile). Inline expand/collapse with AnimatePresence is keyboard-accessible by default, works on all devices, and keeps the definition visible while the user reads — no "chasing" behavior that breaks focus.

### Decision: Staggered animation timing for section cards
Each section card animates in with a slight delay relative to its position. This creates a cascading reveal effect that guides the eye naturally down the page, reducing cognitive overload by showing one unit at a time.

### Decision: Article data fetched server-side via Next.js
The article page fetches its data on the server (using `fetch` with the backend API) before rendering. This provides faster initial paint and better SEO (if article pages are ever shared publicly). The analysis data is fetched once and cached for the session.

## File Changes

- `frontend/src/app/article/[id]/page.tsx` (new) — article viewer page with data fetching
- `frontend/src/components/viewer/ArticleViewer.tsx` (new) — main layout container with scroll reveals
- `frontend/src/components/viewer/DiagramView.tsx` (new) — React Flow diagram wrapper
- `frontend/src/components/viewer/SectionCard.tsx` (new) — individual scroll-revealed content block
- `frontend/src/components/viewer/GlossaryTerm.tsx` (new) — inline expandable term definition
- `frontend/src/lib/api.ts` (modified) — add getArticle endpoint
