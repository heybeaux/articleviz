"use client";

import { usePreferences } from "@/contexts/PreferencesContext";

type MotionPreference = "system" | "reduced" | "all";

const modes: Array<{ key: MotionPreference; label: string; description: string }> = [
  { key: "system", label: "System", description: "Follow OS preference" },
  { key: "reduced", label: "Reduced", description: "Disable animations" },
  { key: "all", label: "All Motion", description: "Enable all animations" },
];

export function MotionToggle() {
  const { motion, setMotion } = usePreferences();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Motion</label>
      <div className="space-y-2">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMotion(m.key)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
              motion === m.key
                ? "border-primary-500 bg-primary-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{m.label}</p>
              <p className="text-xs text-slate-500">{m.description}</p>
            </div>
            {motion === m.key && (
              <span className="text-primary-600 text-lg leading-none">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
