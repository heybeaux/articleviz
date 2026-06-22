"use client";

import { useState } from "react";

interface ApiKeyFormProps {
  settings: {
    provider: string;
    api_key: string;
    base_url: string;
  };
  onChange: (settings: { provider: string; api_key: string; base_url: string }) => void;
  providerDescriptions: Array<{
    key: string;
    label: string;
    description: string;
    needsKey: boolean;
    needsBaseUrl: boolean;
  }>;
  ollamaAvailable: boolean | null;
}

export function ApiKeyForm({
  settings,
  onChange,
  providerDescriptions,
  ollamaAvailable,
}: ApiKeyFormProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Provider
        </label>
        <select
          value={settings.provider}
          onChange={(e) => onChange({ ...settings, provider: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
        >
          {providerDescriptions.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

        <div className="mt-2 text-xs text-slate-500">
          {providerDescriptions.find((p) => p.key === settings.provider)?.description}
        </div>

        {settings.provider === "ollama" && ollamaAvailable !== null && (
          <div className="mt-2 flex items-center gap-1.5">
            {ollamaAvailable ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Ollama detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Ollama not detected — make sure it is running on localhost:11434
              </span>
            )}
          </div>
        )}
      </div>

      {providerDescriptions.find((p) => p.key === settings.provider)?.needsKey && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={settings.api_key}
              onChange={(e) => onChange({ ...settings, api_key: e.target.value })}
              placeholder={
                settings.provider === "ollama" ? "Not required for Ollama" : "sk-..."
              }
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      )}

      {providerDescriptions.find((p) => p.key === settings.provider)?.needsBaseUrl && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Base URL
          </label>
          <input
            type="url"
            value={settings.base_url}
            onChange={(e) => onChange({ ...settings, base_url: e.target.value })}
            placeholder="https://your-omxl-endpoint.com/v1"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {settings.provider !== "omxl" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Base URL{" "}
            <span className="font-normal text-slate-400">(optional — for custom endpoints)</span>
          </label>
          <input
            type="url"
            value={settings.base_url}
            onChange={(e) => onChange({ ...settings, base_url: e.target.value })}
            placeholder="Leave blank for default endpoint"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
      )}
    </div>
  );
}
