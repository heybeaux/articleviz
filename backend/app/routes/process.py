from fastapi import APIRouter, HTTPException

from app.models import AnalysisResponse, ProcessRequest
from app.services.llm import LLMClient, LLMClientConfig
from app.services.visualizer import Visualizer
from app.routes.articles import ArticleStore

router = APIRouter()


@router.post("/api/process", response_model=AnalysisResponse)
async def process_article(request: ProcessRequest):
    if not request.paragraphs:
        raise HTTPException(status_code=400, detail="Article paragraphs are required")

    if request.provider not in {"ollama", "omxl"} and not request.api_key:
        raise HTTPException(status_code=400, detail="API key is required for LLM calls")

    article_text = "\n\n".join(request.paragraphs)

    config = LLMClientConfig(
        provider=request.provider,
        api_key=request.api_key,
        base_url=request.base_url,
        model=request.model,
    )

    client = LLMClient(config)
    visualizer = Visualizer(client)

    try:
        analysis = await visualizer.analyze_article(article_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {str(e)}")

    ArticleStore.save_analysis(request.article_id, analysis.model_dump())

    return analysis
