"use client";

import { useEffect, useState } from "react";
import { getLlmSettings, saveLlmSettings, checkOllama } from "@/lib/api";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";
import { FontToggle } from "@/components/ui/FontToggle";
import { ColorModeToggle } from "@/components/ui/ColorModeToggle";
import { MotionToggle } from "@/components/ui/MotionToggle";

interface LLMSettings {
  provider: string;
  api_key: string;
  base_url: string;
}

const PROVIDERS = [
  {
    key: "openai",
    label: "OpenAI",
    description: "GPT-4o and o-series models. Requires an OpenAI API key.",
    needsKey: true,
    needsBaseUrl: false,
  },
  {
    key: "anthropic",
    label: "Anthropic",
    description: "Claude models. Requires an Anthropic API key.",
    needsKey: true,
    needsBaseUrl: false,
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    description: "Access to many models through a single API. Uses OpenAI-compatible endpoint.",
    needsKey: true,
    needsBaseUrl: false,
  },
  {
    key: "ollama",
    label: "Ollama (Local)",
    description: "Run models locally on your machine. No API key needed.",
    needsKey: false,
    needsBaseUrl: false,
  },
  {
    key: "omxl",
    label: "OMXL",
    description: "OpenAI-compatible endpoint. Requires a custom base URL.",
    needsKey: true,
    needsBaseUrl: true,
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<LLMSettings>({
    provider: "openai",
    api_key: "",
    base_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getLlmSettings();
        setSettings({
          provider: data.provider,
          api_key: data.api_key || "",
          base_url: data.base_url || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.provider === "ollama") {
      async function check() {
        try {
          const data = await checkOllama();
          setOllamaAvailable(data.available);
        } catch {
          setOllamaAvailable(false);
        }
      }
      check();
    } else {
      setOllamaAvailable(null);
    }
  }, [settings.provider]);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      await saveLlmSettings({
        provider: settings.provider,
        api_key: settings.api_key,
        base_url: settings.base_url,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const selectedProvider = PROVIDERS.find((p) => p.key === settings.provider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">
            Configure your LLM provider, API keys, and accessibility preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Accessibility Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Accessibility</h2>
            <div className="space-y-6">
              <FontToggle />
              <ColorModeToggle />
              <MotionToggle />
            </div>
          </div>

          {/* LLM Settings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">LLM Provider</h2>
            <ApiKeyForm
              settings={settings}
              onChange={(s) => setSettings(s)}
              providerDescriptions={PROVIDERS}
              ollamaAvailable={ollamaAvailable}
            />

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            {saved && (
              <p className="mt-4 text-sm text-green-600">Settings saved successfully!</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-2.5 px-6 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Your API keys are stored only in your browser. They are sent to the backend per-request and never persisted on the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
