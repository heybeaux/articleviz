import httpx
from bs4 import BeautifulSoup


def parse_text(text: str) -> tuple[str, str | None]:
    """Normalize plain text input."""
    return (text, None)


def parse_url(url: str) -> tuple[str, str | None]:
    """Fetch a URL and extract body text using httpx + BeautifulSoup."""
    try:
        response = httpx.get(url, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
    except httpx.HTTPStatusError as e:
        return ("", f"Failed to fetch URL: HTTP {e.response.status_code}")
    except httpx.RequestError as e:
        return ("", f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
        tag.decompose()

    body = soup.find("body") or soup
    text = body.get_text(separator="\n", strip=True)

    return (text, None)


def parse_pdf(file_data: bytes) -> tuple[str, str | None]:
    """Extract text from a PDF using PyMuPDF (fitz)."""
    try:
        import fitz

        doc = fitz.open(stream=file_data, filetype="pdf")
        pages: list[str] = []
        for page in doc:
            text = page.get_text()
            pages.append(text.strip())
        doc.close()

        if not any(p for p in pages):
            return ("", "No text content found in PDF")

        return ("\n\n".join(pages), None)
    except Exception:
        return ("", "Failed to parse PDF file — it may be corrupt or password-protected")


def parse_docx(file_data: bytes) -> tuple[str, str | None]:
    """Extract paragraph text from a DOCX file using python-docx."""
    try:
        from docx import Document

        doc = Document(file_data)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

        if not paragraphs:
            return ("", "No text content found in document")

        return ("\n\n".join(paragraphs), None)
    except Exception:
        return ("", "Failed to parse DOCX file — it may be corrupt")
