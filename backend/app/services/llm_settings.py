import os
import re
from dataclasses import dataclass
from typing import Protocol


SUPPORTED_PROVIDERS = {"openai", "anthropic", "openrouter", "ollama", "omxl"}
PROVIDERS_REQUIRING_KEYS = {"openai", "anthropic", "openrouter", "omxl"}

PROVIDER_API_KEY_ENV_VARS: dict[str, tuple[str, ...]] = {
    "openai": ("OPENAI_API_KEY", "LLM_API_KEY"),
    "anthropic": ("ANTHROPIC_API_KEY", "LLM_API_KEY"),
    "openrouter": ("OPENROUTER_API_KEY", "LLM_API_KEY"),
    "omxl": ("OMXL_API_KEY", "LLM_API_KEY"),
    "ollama": (),
}

PROVIDER_BASE_URL_ENV_VARS: dict[str, tuple[str, ...]] = {
    "openai": ("OPENAI_BASE_URL", "LLM_BASE_URL"),
    "anthropic": ("ANTHROPIC_BASE_URL", "LLM_BASE_URL"),
    "openrouter": ("OPENROUTER_BASE_URL", "LLM_BASE_URL"),
    "omxl": ("OMXL_BASE_URL", "LLM_BASE_URL"),
    "ollama": ("OLLAMA_BASE_URL", "LLM_BASE_URL"),
}

REDACTED = "[REDACTED]"


class EnterpriseWorkspaceKeyStore(Protocol):
    """Seam for encrypted per-workspace BYOK in the enterprise path.

    TODO(WP-2 enterprise): implement with envelope encryption, workspace scoping,
    audited rotation, and revocation. Normal users use server-managed keys only.
    """

    def get_api_key(self, workspace_id: str, provider: str) -> str:
        ...

    def rotate_api_key(self, workspace_id: str, provider: str, api_key: str) -> None:
        ...

    def revoke_api_key(self, workspace_id: str, provider: str) -> None:
        ...


@dataclass
class LLMSettingsState:
    provider: str
    base_url: str = ""


class ServerManagedKeyStore:
    def __init__(self) -> None:
        self._runtime_keys: dict[str, str] = {}

    def get_api_key(self, provider: str) -> str:
        provider = normalize_provider(provider)
        runtime_key = self._runtime_keys.get(provider, "")
        if runtime_key:
            return runtime_key

        for env_var in PROVIDER_API_KEY_ENV_VARS.get(provider, ()):  # pragma: no branch - tiny loop
            value = os.getenv(env_var, "")
            if value:
                return value

        return ""

    def has_api_key(self, provider: str) -> bool:
        if provider == "ollama":
            return False
        return bool(self.get_api_key(provider))

    def rotate_api_key(self, provider: str, api_key: str) -> None:
        provider = normalize_provider(provider)
        if not api_key.strip():
            raise ValueError("API key cannot be empty")
        self._runtime_keys[provider] = api_key

    def revoke_runtime_api_key(self, provider: str | None = None) -> None:
        if provider is None:
            self._runtime_keys.clear()
            return
        self._runtime_keys.pop(normalize_provider(provider), None)

    def known_secrets(self) -> list[str]:
        secrets = [value for value in self._runtime_keys.values() if value]
        for env_vars in PROVIDER_API_KEY_ENV_VARS.values():
            for env_var in env_vars:
                value = os.getenv(env_var, "")
                if value:
                    secrets.append(value)
        return secrets


def normalize_provider(provider: str) -> str:
    normalized = (provider or "").strip().lower()
    if normalized not in SUPPORTED_PROVIDERS:
        raise ValueError("Unknown LLM provider")
    return normalized


def provider_requires_key(provider: str) -> bool:
    return normalize_provider(provider) in PROVIDERS_REQUIRING_KEYS


def get_env_base_url(provider: str) -> str:
    provider = normalize_provider(provider)
    for env_var in PROVIDER_BASE_URL_ENV_VARS.get(provider, ()):  # pragma: no branch - tiny loop
        value = os.getenv(env_var, "")
        if value:
            return value
    return ""


def get_initial_settings() -> LLMSettingsState:
    provider = normalize_provider(os.getenv("LLM_PROVIDER", "ollama"))
    return LLMSettingsState(provider=provider, base_url=get_env_base_url(provider))


key_store = ServerManagedKeyStore()
settings_state = get_initial_settings()


def save_settings(provider: str, base_url: str = "", api_key: str | None = None) -> LLMSettingsState:
    provider = normalize_provider(provider)
    settings_state.provider = provider
    settings_state.base_url = base_url.strip()

    if api_key and api_key.strip():
        key_store.rotate_api_key(provider, api_key)

    return settings_state


def rotate_api_key(provider: str, api_key: str, base_url: str | None = None) -> LLMSettingsState:
    provider = normalize_provider(provider)
    key_store.rotate_api_key(provider, api_key)
    settings_state.provider = provider
    if base_url is not None:
        settings_state.base_url = base_url.strip()
    return settings_state


def clear_settings() -> LLMSettingsState:
    key_store.revoke_runtime_api_key()
    initial = get_initial_settings()
    settings_state.provider = initial.provider
    settings_state.base_url = initial.base_url
    return settings_state


def get_settings() -> LLMSettingsState:
    return settings_state


def redact_secrets(value: object) -> str:
    text = str(value)
    for secret in sorted(set(key_store.known_secrets()), key=len, reverse=True):
        if len(secret) >= 4:
            text = text.replace(secret, REDACTED)

    key_patterns = (
        r"sk-[A-Za-z0-9_\-]{8,}",
        r"sk-ant-[A-Za-z0-9_\-]{8,}",
        r"Bearer\s+[A-Za-z0-9._\-]{8,}",
        r"(?i)(api[_-]?key['\"\s:=]+)[A-Za-z0-9._\-]{8,}",
    )
    for pattern in key_patterns:
        text = re.sub(pattern, lambda match: match.group(1) + REDACTED if match.lastindex else REDACTED, text)

    return text
