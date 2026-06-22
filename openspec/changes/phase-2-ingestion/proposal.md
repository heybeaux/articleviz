# Proposal: Phase 2 — Article Ingestion

## Intent

Enable users to provide articles in multiple formats. This is the primary input mechanism for the product — without it, there's no content to transform. Users should be able to paste text directly, drop a URL to scrape, or upload PDF/DOCX files.

## Scope

**In scope:**
- Text paste input (direct text area)
- URL submission with web scraping (httpx + BeautifulSoup4)
- PDF file upload with text extraction (PyMuPDF / fitz)
- DOCX file upload with text extraction (python-docx)
- Content normalization pipeline (strip HTML tags, clean whitespace, extract paragraphs)
- Frontend upload UI with tabbed input and drag-drop zone
- Error handling for corrupt files, failed URL fetches, unsupported formats

**Out of scope:**
- LLM processing of the article (Phase 3)
- Image extraction from PDFs
- OCR for scanned documents
- Article editing after upload

## Approach

1. Backend creates a `/api/upload` endpoint accepting multipart form data with format detection
2. Four parser handlers route based on input type:
   - **Text:** passed through directly with whitespace normalization
   - **URL:** fetched via httpx, HTML parsed with BeautifulSoup4 to extract body text
   - **PDF:** opened with PyMuPDF (fitz), text extracted from each page
   - **DOCX:** opened with python-docx, paragraphs joined and cleaned
3. A content normalizer strips residual HTML, collapses whitespace, splits into paragraph blocks
4. Frontend creates upload page with tabbed interface (Text / URL / PDF / DOCX)
5. Drag-and-drop zone for file uploads with file type validation and size limits

## ADHD/Neurodiversity Consideration

Multiple input methods reduce friction — users have different ways of encountering articles (saved PDFs, bookmarked URLs, copied text). Offering all options means no cognitive overhead deciding "the right way" to submit content. Clear error messages with specific guidance (not generic failures) prevent frustration loops common in ADHD workflows.
