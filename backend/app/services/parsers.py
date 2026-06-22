import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup


MAX_REDIRECTS = 5
BLOCKED_IPS = {
    ipaddress.ip_address("169.254.169.254"),
    ipaddress.ip_address("::1"),
}


def _validate_url_for_fetch(url: str) -> str | None:
    """Return an error message if a URL is invalid or resolves to unsafe IPs."""
    parsed_url = urlparse(url)

    if parsed_url.scheme not in {"http", "https"}:
        return "Invalid URL: only http and https schemes are allowed"

    if not parsed_url.hostname:
        return "Invalid URL: hostname is required"

    try:
        address_info = socket.getaddrinfo(parsed_url.hostname, parsed_url.port)
    except socket.gaierror as e:
        return f"Invalid URL: failed to resolve hostname ({e})"

    for address in address_info:
        ip_text = address[4][0].split("%", 1)[0]
        ip_address = ipaddress.ip_address(ip_text)
        if (
            ip_address in BLOCKED_IPS
            or ip_address.is_private
            or ip_address.is_loopback
            or ip_address.is_link_local
            or ip_address.is_reserved
            or ip_address.is_multicast
            or ip_address.is_unspecified
        ):
            return f"Blocked URL: hostname resolves to disallowed IP address {ip_address}"

    return None


def parse_text(text: str) -> tuple[str, str | None]:
    """Normalize plain text input."""
    return (text, None)


def parse_url(url: str) -> tuple[str, str | None]:
    """Fetch a URL and extract body text using httpx + BeautifulSoup."""
    try:
        current_url = url
        redirect_count = 0

        while True:
            validation_error = _validate_url_for_fetch(current_url)
            if validation_error:
                return ("", validation_error)

            response = httpx.get(current_url, timeout=15.0, follow_redirects=False)

            if not response.is_redirect:
                response.raise_for_status()
                break

            if redirect_count >= MAX_REDIRECTS:
                return ("", f"Failed to fetch URL: exceeded {MAX_REDIRECTS} redirects")

            redirect_location = response.headers.get("location")
            if not redirect_location:
                return ("", "Failed to fetch URL: redirect response missing Location header")

            current_url = urljoin(str(response.url), redirect_location)
            redirect_count += 1
    except httpx.HTTPStatusError as e:
        return ("", f"Failed to fetch URL: HTTP {e.response.status_code}")
    except httpx.RequestError as e:
        return ("", f"Failed to fetch URL: {e}")
    except ValueError as e:
        return ("", f"Invalid URL: {e}")

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
