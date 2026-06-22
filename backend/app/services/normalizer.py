import re
from bs4 import BeautifulSoup


def normalize_content(raw_text: str) -> list[str]:
    """Strip HTML, collapse whitespace, split into paragraph blocks."""
    text = strip_html(raw_text)
    text = collapse_whitespace(text)
    paragraphs = split_paragraphs(text)
    return [p for p in paragraphs if len(p.strip()) > 0]


def strip_html(html: str) -> str:
    """Remove all HTML tags, leaving readable text."""
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text()


def collapse_whitespace(text: str) -> str:
    """Collapse multiple spaces/newlines into single spaces."""
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_paragraphs(text: str) -> list[str]:
    """Split text into paragraph blocks on double newlines or significant breaks."""
    parts = re.split(r"\n{2,}", text)
    return [p.strip() for p in parts]
