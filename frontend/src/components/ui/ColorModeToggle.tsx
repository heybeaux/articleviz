"use client";

import { usePreferences } from "@/contexts/PreferencesContext";

type ColorModePreference = "standard" | "protanopia" | "deuteranopia" | "tritanopia";

const palettes: Array<{
  key: ColorModePreference;
  label: string;
  description: string;
  colors: string[];
}> = [
  {
    key: "standard",
    label: "Standard",
    description: "Default color palette",
    colors: ["#0284c7", "#10b981", "#f59e0b", "#ef4444"],
  },
  {
    key: "protanopia",
    label: "Protanopia",
    description: "Red-blind safe",
    colors: ["#2563eb", "#059669", "#d97706", "#dc2626"],
  },
  {
    key: "deuteranopia",
    label: "Deuteranopia",
    description: "Green-blind safe",
    colors: ["#e8710f", "#a855f7", "#d97706", "#dc2626"],
  },
  {
    key: "tritanopia",
    label: "Tritanopia",
    description: "Blue-blind safe",
    colors: ["#22c55e", "#a855f7", "#0ea5e9", "#ef4444"],
  },
];

export function ColorModeToggle() {
  const { colorMode, setColorMode } = usePreferences();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Color Palette</label>
      <div className="space-y-2">
        {palettes.map((p) => (
          <button
            key={p.key}
            onClick={() => setColorMode(p.key)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
              colorMode === p.key
                ? "border-primary-500 bg-primary-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {p.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{p.label}</p>
                <p className="text-xs text-slate-500">{p.description}</p>
              </div>
            </div>
            {colorMode === p.key && (
              <span className="text-primary-600 text-lg leading-none">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
