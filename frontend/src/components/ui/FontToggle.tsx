"use client";

import { usePreferences } from "@/contexts/PreferencesContext";

const fonts: Array<{ key: FontPreference; label: string; preview: string }> = [
  { key: "inter", label: "Inter", preview: "The quick brown fox" },
  { key: "lexend", label: "Lexend", preview: "The quick brown fox" },
  { key: "atkinson", label: "Atkinson Hyperlegible", preview: "The quick brown fox" },
];

type FontPreference = "inter" | "lexend" | "atkinson";

export function FontToggle() {
  const { font, setFont } = usePreferences();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Font</label>
      <div className="space-y-2">
        {fonts.map((f) => (
          <button
            key={f.key}
            onClick={() => setFont(f.key)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
              font === f.key
                ? "border-primary-500 bg-primary-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{f.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.preview}</p>
            </div>
            {font === f.key && (
              <span className="text-primary-600 text-lg leading-none">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
