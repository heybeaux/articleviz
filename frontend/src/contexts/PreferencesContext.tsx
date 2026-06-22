"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type FontPreference = "inter" | "lexend" | "atkinson";
export type ColorModePreference = "standard" | "protanopia" | "deuteranopia" | "tritanopia";
export type MotionPreference = "system" | "reduced" | "all";

interface Preferences {
  font: FontPreference;
  colorMode: ColorModePreference;
  motion: MotionPreference;
}

interface PreferencesContextValue extends Preferences {
  setFont: (font: FontPreference) => void;
  setColorMode: (colorMode: ColorModePreference) => void;
  setMotion: (motion: MotionPreference) => void;
}

const STORAGE_KEY = "articleviz-preferences";

function getOSReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function loadFromStorage(): Preferences | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveToStorage(prefs: Preferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

const defaultPreferences: Preferences = {
  font: "inter",
  colorMode: "standard",
  motion: getOSReducedMotion() ? "reduced" : "all",
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setPreferences({ ...defaultPreferences, ...stored });
    } else {
      updateHTMLOnMount(defaultPreferences);
    }
  }, []);

  const applyToHTML = useCallback((prefs: Preferences) => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;

    html.removeAttribute("data-font");
    if (prefs.font !== "inter") {
      html.setAttribute("data-font", prefs.font);
    }

    html.removeAttribute("data-color-mode");
    if (prefs.colorMode !== "standard") {
      html.setAttribute("data-color-mode", prefs.colorMode);
    }
  }, []);

  const updateHTMLOnMount = useCallback((prefs: Preferences) => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;

    if (prefs.font !== "inter") {
      html.setAttribute("data-font", prefs.font);
    }

    if (prefs.colorMode !== "standard") {
      html.setAttribute("data-color-mode", prefs.colorMode);
    }
  }, []);

  const updatePrefs = useCallback((update: Partial<Preferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...update };
      saveToStorage(next);
      applyToHTML(next);
      return next;
    });
  }, [applyToHTML]);

  const setFont = useCallback((font: FontPreference) => updatePrefs({ font }), [updatePrefs]);
  const setColorMode = useCallback((colorMode: ColorModePreference) => updatePrefs({ colorMode }), [updatePrefs]);
  const setMotion = useCallback((motion: MotionPreference) => updatePrefs({ motion }), [updatePrefs]);

  return (
    <PreferencesContext.Provider value={{ ...preferences, setFont, setColorMode, setMotion }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}

export function useReducedMotion(): boolean {
  const { motion } = usePreferences();
  if (motion === "reduced") return true;
  if (motion === "all") return false;
  return getOSReducedMotion();
}
