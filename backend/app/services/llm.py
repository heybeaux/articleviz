import os
import httpx
from typing import Literal

from pydantic import BaseModel, Field

from app.models import LLMResponse

Provider = Literal["openai", "anthropic", "openrouter", "ollama", "omxl"]

DEFAULT_MODELS: dict[Provider, str] = {
    "openai": "gpt-4o",
    "anthropic": "claude-sonnet-4-20250514",
    "openrouter": "anthropic/claude-sonnet-4-20250514",
    "ollama": "qwen3.5:35b",
    "omxl": "omxl-default",
}


class LLMClientConfig(BaseModel):
    provider: Provider = "openai"
    api_key: str = ""
    base_url: str = ""
    model: str = ""


class LLMClient:
    def __init__(self, config: LLMClientConfig | None = None):
        self.config = config or LLMClientConfig()

    def update(self, provider: Provider | None = None, api_key: str | None = None, base_url: str | None = None, model: str | None = None):
        if provider is not None:
            self.config.provider = provider
        if api_key is not None:
            self.config.api_key = api_key
        if base_url is not None:
            self.config.base_url = base_url
        if model is not None:
            self.config.model = model

    async def generate(self, prompt: str, system_prompt: str | None = None, max_tokens: int = 4096) -> LLMResponse:
        provider = self.config.provider

        adapters = {
            "openai": self._adapt_openai,
            "anthropic": self._adapt_anthropic,
            "openrouter": self._adapt_openrouter,
            "ollama": self._adapt_ollama,
            "omxl": self._adapt_omxl,
        }

        adapter = adapters.get(provider)
        if adapter is None:
            raise ValueError(f"Unknown provider: {provider}")

        return await adapter(prompt, system_prompt, max_tokens)

    async def _adapt_openai(self, prompt: str, system_prompt: str | None, max_tokens: int) -> LLMResponse:
        from openai import AsyncOpenAI

        model = self.config.model or DEFAULT_MODELS["openai"]
        base_url = self.config.base_url or None

        kwargs: dict = {"api_key": self.config.api_key or "not-needed"}
        if base_url:
            kwargs["base_url"] = base_url

        client = AsyncOpenAI(**kwargs)

        messages: list[dict] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
        )

        content = response.choices[0].message.content or ""
        usage = response.usage

        return LLMResponse(
            content=content,
            model=model,
            usage_tokens_prompt=usage.prompt_tokens if usage else 0,
            usage_tokens_completion=usage.completion_tokens if usage else 0,
        )

    async def _adapt_anthropic(self, prompt: str, system_prompt: str | None, max_tokens: int) -> LLMResponse:
        from anthropic import AsyncAnthropic

        model = self.config.model or DEFAULT_MODELS["anthropic"]
        api_key = self.config.api_key

        client = AsyncAnthropic(api_key=api_key)

        messages: list[dict] = [{"role": "user", "content": prompt}]

        response = await client.messages.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            system=system_prompt or "",
        )

        content = response.content[0].text if response.content and len(response.content) > 0 else ""

        return LLMResponse(
            content=content,
            model=model,
            usage_tokens_prompt=0,
            usage_tokens_completion=0,
        )

    async def _adapt_openrouter(self, prompt: str, system_prompt: str | None, max_tokens: int) -> LLMResponse:
        from openai import AsyncOpenAI

        model = self.config.model or DEFAULT_MODELS["openrouter"]
        base_url = self.config.base_url or "https://openrouter.ai/api/v1"

        client = AsyncOpenAI(
            api_key=self.config.api_key or "not-needed",
            base_url=base_url,
        )

        messages: list[dict] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
        )

        content = response.choices[0].message.content or ""
        usage = response.usage

        return LLMResponse(
            content=content,
            model=model,
            usage_tokens_prompt=usage.prompt_tokens if usage else 0,
            usage_tokens_completion=usage.completion_tokens if usage else 0,
        )

    async def _adapt_ollama(self, prompt: str, system_prompt: str | None, max_tokens: int) -> LLMResponse:
        model = self.config.model or DEFAULT_MODELS["ollama"]
        base_url = self.config.base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": full_prompt,
                    "stream": False,
                    "think": False,
                    "format": "json",
                    "options": {
                        "num_predict": max_tokens,
                    },
                },
            )

            response.raise_for_status()
            data = response.json()

        content = data.get("response", "")

        prompt_tokens = data.get("prompt_eval_count", 0)
        completion_tokens = data.get("eval_count", 0)

        return LLMResponse(
            content=content,
            model=model,
            usage_tokens_prompt=prompt_tokens,
            usage_tokens_completion=completion_tokens,
        )

    async def _adapt_omxl(self, prompt: str, system_prompt: str | None, max_tokens: int) -> LLMResponse:
        from openai import AsyncOpenAI

        model = self.config.model or DEFAULT_MODELS["omxl"]
        base_url = self.config.base_url

        if not base_url:
            raise ValueError("OMXL provider requires a base_url configuration")

        client = AsyncOpenAI(
            api_key=self.config.api_key or "not-needed",
            base_url=base_url,
        )

        messages: list[dict] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
        )

        content = response.choices[0].message.content or ""
        usage = response.usage

        return LLMResponse(
            content=content,
            model=model,
            usage_tokens_prompt=usage.prompt_tokens if usage else 0,
            usage_tokens_completion=usage.completion_tokens if usage else 0,
        )


async def check_ollama_available(base_url: str | None = None) -> bool:
    url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{url}/api/tags")
            return response.status_code == 200
    except Exception:
        return False
