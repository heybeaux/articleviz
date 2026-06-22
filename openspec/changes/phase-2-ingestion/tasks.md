# Tasks: Phase 2 — Article Ingestion

## 1. Backend Upload Endpoint
- [x] 1.1 Create `backend/app/routes/upload.py` with `/api/upload` endpoint
- [x] 1.2 Implement type routing logic (text / url / pdf / docx)
- [x] 1.3 Add request validation (required fields, file size limits)

## 2. Parser Services
- [x] 2.1 Create `backend/app/services/parsers.py` with text parser (whitespace normalization)
- [x] 2.2 Implement URL parser using httpx + BeautifulSoup4 (body text extraction)
- [x] 2.3 Implement PDF parser using PyMuPDF (page-by-page text extraction)
- [x] 2.4 Implement DOCX parser using python-docx (paragraph extraction)
- [x] 2.5 Create content normalizer (strip HTML, collapse whitespace, split paragraphs)

## 3. Frontend Upload UI
- [x] 3.1 Create `frontend/src/components/upload/InputTabs.tsx` with Text / URL / PDF / DOCX tabs
- [x] 3.2 Create `frontend/src/components/upload/UploadArea.tsx` with drag-drop zone
- [x] 3.3 Implement text paste input area (large textarea)
- [x] 3.4 Implement URL input field with fetch preview button
- [x] 3.5 Implement file upload with drag-drop and click-to-browse
- [x] 3.6 Add file type validation (PDF, DOCX) and size limit display
- [x] 3.7 Wire upload UI to backend `/api/upload` endpoint

## 4. Error Handling
- [x] 4.1 Handle corrupt PDF files with user-friendly error message
- [x] 4.2 Handle DOCX parsing errors gracefully
- [x] 4.3 Handle URL fetch failures (timeout, non-200 status, no body content)
- [x] 4.4 Handle empty text input with clear validation feedback

## 5. Verification
- [x] 5.1 Test text paste upload returns cleaned paragraph blocks
- [x] 5.2 Test URL upload extracts readable body text from a sample article
- [x] 5.3 Test PDF upload extracts text from a standard PDF
- [x] 5.4 Test DOCX upload extracts paragraphs from a .docx file
