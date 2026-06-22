"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/contexts/PreferencesContext";
import { SectionCard } from "./SectionCard";
import { DiagramView } from "./DiagramView";
import { GlossaryTerm } from "./GlossaryTerm";

interface ArticleViewerProps {
  articleId: string;
  wordCount: number;
  tlDr: string;
  keyTakeaways: string[];
  sections: Array<{ id: string; heading: string; content: string; order: number }>;
  conceptMap: { nodes: Array<{ id: string; label: string; category: string }>; edges: Array<{ from_node: string; to_node: string; label: string }> } | null;
  glossary: Array<{ term: string; definition: string; context: string }>;
}

export function ArticleViewer({
  articleId,
  wordCount,
  tlDr,
  keyTakeaways,
  sections,
  conceptMap,
  glossary,
}: ArticleViewerProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
      className="max-w-3xl mx-auto px-4 py-8 space-y-6"
    >
      <motion.div
        initial={{ opacity: reducedMotion ? 1 : 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.4, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <a href="/" className="text-xs text-slate-500 hover:text-primary-600 transition-colors">
            ← Home
          </a>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500">{wordCount.toLocaleString()} words</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Article Analysis: {articleId.slice(0, 8)}
        </h1>
      </motion.div>

      {tlDr && (
        <motion.div
          initial={{ opacity: reducedMotion ? 1 : 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, delay: 0.2 }}
          className="bg-gradient-to-r from-primary-50 to-sky-50 rounded-xl border border-primary-200 p-6"
        >
          <h2 className="text-sm font-semibold text-primary-800 mb-2">TL;DR</h2>
          <p className="text-sm text-primary-900 leading-relaxed">{tlDr}</p>

          {keyTakeaways.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-primary-700 mb-2">Key Takeaways</h3>
              <ul className="space-y-1.5">
                {keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-primary-800">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {glossary.length > 0 && (
        <motion.div
          initial={{ opacity: reducedMotion ? 1 : 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, delay: 0.25 }}
        >
          <DiagramView conceptMap={conceptMap} />
        </motion.div>
      )}

      <div className="space-y-4">
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            heading={section.heading}
            content={section.content}
            index={index}
          />
        ))}
      </div>

      {glossary.length > 0 && (
        <motion.div
          initial={{ opacity: reducedMotion ? 1 : 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, delay: sections.length * 0.1 + 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Glossary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {glossary.map((entry, i) => (
                <GlossaryTerm key={i} term={entry.term} definition={entry.definition} context={entry.context} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.4, delay: sections.length * 0.1 + 0.3 }}
        className="text-center py-6 border-t border-slate-200"
      >
        <a href="/" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
          Upload another article →
        </a>
      </motion.div>
    </motion.div>
  );
}
