"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/contexts/PreferencesContext";
import { GlossaryTerm } from "./GlossaryTerm";

interface SectionCardProps {
  heading: string;
  content: string;
  index: number;
  glossaryTerms?: Array<{ term: string; definition: string; context: string }>;
}

function renderContentWithGlossary(content: string, glossaryTerms?: Array<{ term: string; definition: string; context: string }>) {
  if (!glossaryTerms || glossaryTerms.length === 0) {
    return <p className="text-sm text-slate-700 leading-relaxed">{content}</p>;
  }

  const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const findTerms = (text: string, offset: number = 0): React.ReactNode[] => {
    let bestMatch: { index: number; length: number; term: typeof glossaryTerms[0] } | null = null;

    for (const gTerm of sortedTerms) {
      const idx = text.toLowerCase().indexOf(gTerm.term.toLowerCase(), offset);
      if (idx !== -1 && (!bestMatch || idx < bestMatch.index)) {
        bestMatch = { index: idx, length: gTerm.term.length, term: gTerm };
      }
    }

    if (!bestMatch) {
      return [<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>];
    }

    const before = text.slice(lastIndex, bestMatch.index);
    parts.push(...findTerms(text, bestMatch.index + bestMatch.length));

    return [
      ...(before ? [<span key={`text-${lastIndex}`}>{before}</span>] : []),
      <GlossaryTerm key={`term-${bestMatch.term.term}`} term={bestMatch.term.term} definition={bestMatch.term.definition} context={bestMatch.term.context} />,
    ];
  };

  return <p className="text-sm text-slate-700 leading-relaxed">{findTerms(content)}</p>;
}

export function SectionCard({ heading, content, index, glossaryTerms }: SectionCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      transition={{ duration: reducedMotion ? 0 : 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
          {index + 1}
        </span>
        <h3 className="text-base font-semibold text-slate-900">{heading}</h3>
      </div>
      {renderContentWithGlossary(content, glossaryTerms)}
    </motion.div>
  );
}
