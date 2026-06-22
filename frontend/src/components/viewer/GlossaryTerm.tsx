"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/contexts/PreferencesContext";

interface GlossaryTermProps {
  term: string;
  definition: string;
  context?: string;
}

export function GlossaryTerm({ term, definition, context }: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  const toggle = () => setIsOpen((v) => !v);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <span className="inline-block relative">
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="inline-block border-b-2 border-dashed cursor-pointer hover:border-primary-400 transition-colors text-primary-700 font-medium"
        style={{ borderBottomColor: isOpen ? "var(--color-foreground)" : undefined }}
      >
        {term}
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: reducedMotion ? 1 : 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reducedMotion ? 1 : 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="absolute z-50 bottom-full left-0 mb-2 w-72 sm:w-80"
          >
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{term}</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                  aria-label="Close definition"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{definition}</p>
              {context && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic leading-relaxed">{context}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
