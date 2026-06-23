from fastapi import APIRouter, HTTPException

from app.models import LLMKeyRotationRequest, LLMSettingsRequest, LLMSettingsResponse
from app.services import llm_settings
from app.services.llm import check_ollama_available

router = APIRouter()


def _safe_response() -> LLMSettingsResponse:
    settings = llm_settings.get_settings()
    return LLMSettingsResponse(
        provider=settings.provider,
        base_url=settings.base_url,
        has_key=llm_settings.key_store.has_api_key(settings.provider),
    )


@router.post("/api/settings/llm", response_model=LLMSettingsResponse)
async def save_llm_settings(request: LLMSettingsRequest):
    try:
        llm_settings.save_settings(
            provider=request.provider,
            api_key=request.api_key,
            base_url=request.base_url,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=llm_settings.redact_secrets(e))
    return _safe_response()


@router.post("/api/settings/llm/rotate", response_model=LLMSettingsResponse)
async def rotate_llm_key(request: LLMKeyRotationRequest):
    try:
        llm_settings.rotate_api_key(
            provider=request.provider,
            api_key=request.api_key,
            base_url=request.base_url,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=llm_settings.redact_secrets(e))
    return _safe_response()


@router.get("/api/settings/llm", response_model=LLMSettingsResponse)
async def get_llm_settings():
    return _safe_response()


@router.delete("/api/settings/llm", response_model=LLMSettingsResponse)
async def clear_llm_settings():
    llm_settings.clear_settings()
    return _safe_response()


@router.get("/api/settings/ollama/check")
async def check_ollama():
    available = await check_ollama_available()
    return {"available": available}
