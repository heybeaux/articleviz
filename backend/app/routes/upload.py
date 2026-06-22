import uuid
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.parsers import parse_docx, parse_pdf, parse_text, parse_url
from app.services.normalizer import normalize_content
from app.routes.articles import ArticleStore

router = APIRouter()


class UploadResponse(BaseModel):
    article_id: str
    paragraphs: list[str]
    word_count: int


ALLOWED_FILE_TYPES = {"pdf", "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/api/upload", response_model=UploadResponse)
async def upload_article(
    type: str = Form(...),
    text: str | None = Form(None),
    url: str | None = Form(None),
    file: UploadFile | None = File(None),
):
    if type not in ("text", "url", "pdf", "docx"):
        raise HTTPException(status_code=400, detail="Invalid type. Must be: text, url, pdf, or docx")

    raw_text = ""
    error = None

    if type == "text":
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Text input cannot be empty")
        raw_text, error = parse_text(text)

    elif type == "url":
        if not url:
            raise HTTPException(status_code=400, detail="URL cannot be empty")
        raw_text, error = parse_url(url)

    elif type == "pdf":
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        if file.filename and file.filename.rsplit(".", 1)[-1].lower() not in ALLOWED_FILE_TYPES:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_FILE_TYPES))}")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File too large. Maximum size is 10 MB")

        raw_text, error = parse_pdf(content)

    elif type == "docx":
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        if file.filename and file.filename.rsplit(".", 1)[-1].lower() not in ALLOWED_FILE_TYPES:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_FILE_TYPES))}")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File too large. Maximum size is 10 MB")

        raw_text, error = parse_docx(content)

    if error:
        raise HTTPException(status_code=400, detail=error)

    paragraphs = normalize_content(raw_text)
    word_count = sum(len(p.split()) for p in paragraphs)

    article_id = str(uuid.uuid4())
    ArticleStore.save_article(article_id, paragraphs, word_count)

    return UploadResponse(
        article_id=article_id,
        paragraphs=paragraphs,
        word_count=word_count,
    )
