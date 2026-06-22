# Design: Phase 2 — Article Ingestion

## Technical Approach

A single `/api/upload` endpoint accepts a multipart form with a `type` field (`text`, `url`, `pdf`, `docx`) and the corresponding content. The backend routes to the appropriate parser based on type, then normalizes the output into a structured response.

## Architecture Decisions

### Decision: Single endpoint with type routing over separate endpoints
Using one `/api/upload` endpoint with a `type` field keeps the API simple. The frontend sends one format, receives one response shape. Separate endpoints (`/api/upload/text`, `/api/upload/url`, etc.) would add unnecessary complexity for four input methods.

### Decision: PyMuPDF over pdfplumber
PyMuPDF (fitz) is faster for text extraction and handles a wider range of PDF formats. pdfplumber is better for layout analysis, but text extraction quality and speed are more important for MVP. Layout analysis can be added later if needed.

### Decision: BeautifulSoup4 over lxml
BeautifulSoup with the html.parser engine is sufficient for extracting body text from URLs. We don't need lxml's performance at this scale, and BeautifulSoup's API is simpler for the "extract text from body" use case.

### Decision: Content normalization as a separate pipeline step
Stripping HTML, cleaning whitespace, and splitting into paragraphs is a distinct concern from parsing. A separate normalizer function keeps parsers focused on format-specific extraction and the normalizer focused on content quality.

## Data Flow

```
Frontend upload → POST /api/upload → Type router
    ├── text   → raw text → normalize → ParagraphBlock[]
    ├── url    → httpx + bs4 → extract body → normalize → ParagraphBlock[]
    ├── pdf    → PyMuPDF → page text → normalize → ParagraphBlock[]
    └── docx   → python-docx → paragraphs → normalize → ParagraphBlock[]
```

## File Changes

- `backend/app/routes/upload.py` (new) — upload endpoint with type routing
- `backend/app/services/parsers.py` (new) — text, URL, PDF, DOCX parsers + normalizer
- `backend/pyproject.toml` (modified) — add httpx, beautifulsoup4, pymupdf, python-docx
- `frontend/src/app/page.tsx` (modified) — upload page with tabbed input UI
- `frontend/src/components/upload/UploadArea.tsx` (new) — drag-drop zone component
- `frontend/src/components/upload/InputTabs.tsx` (new) — tabbed input switcher
- `frontend/src/lib/api.ts` (modified) — add upload endpoint method
