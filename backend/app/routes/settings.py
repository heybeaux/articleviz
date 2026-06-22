import os

from fastapi import APIRouter, HTTPException

from app.models import LLMSettingsRequest, LLMSettingsResponse
from app.services.llm import check_ollama_available

router = APIRouter()

_llm_settings: dict = {
    "provider": os.getenv("LLM_PROVIDER", "ollama"),
    "api_key": os.getenv("LLM_API_KEY", ""),
    "base_url": os.getenv("LLM_BASE_URL", ""),
}


@router.post("/api/settings/llm", response_model=LLMSettingsResponse)
async def save_llm_settings(request: LLMSettingsRequest):
    _llm_settings["provider"] = request.provider
    _llm_settings["api_key"] = request.api_key
    _llm_settings["base_url"] = request.base_url

    return LLMSettingsResponse(
        provider=_llm_settings["provider"],
        api_key=_llm_settings["api_key"],
        base_url=_llm_settings["base_url"],
    )


@router.get("/api/settings/llm", response_model=LLMSettingsResponse)
async def get_llm_settings():
    return LLMSettingsResponse(
        provider=_llm_settings["provider"],
        api_key=_llm_settings["api_key"],
        base_url=_llm_settings["base_url"],
    )


@router.delete("/api/settings/llm")
async def clear_llm_settings():
    _llm_settings["provider"] = os.getenv("LLM_PROVIDER", "ollama")
    _llm_settings["api_key"] = os.getenv("LLM_API_KEY", "")
    _llm_settings["base_url"] = os.getenv("LLM_BASE_URL", "")

    return {"status": "cleared"}


@router.get("/api/settings/ollama/check")
async def check_ollama():
    available = await check_ollama_available()
    return {"available": available}
