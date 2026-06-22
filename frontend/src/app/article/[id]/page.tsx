"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArticleViewer } from "@/components/viewer/ArticleViewer";
import { getArticle } from "@/lib/api";

interface AnalysisData {
  sections: Array<{ id: string; heading: string; content: string; order: number }>;
  concept_map: { nodes: Array<{ id: string; label: string; category: string }>; edges: Array<{ from_node: string; to_node: string; label: string }> };
  glossary: Array<{ term: string; definition: string; context: string }>;
  summary: { tl_dr: string; key_takeaways: string[] };
}

interface ArticleData {
  article_id: string;
  word_count: number;
  analysis?: AnalysisData;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [data, setData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const result = await getArticle(articleId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load article");
      } finally {
        setLoading(false);
      }
    }

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-slate-900 mb-2">Failed to load article</p>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-slate-900 mb-2">Article not found</p>
          <p className="text-sm text-slate-600 mb-4">The article you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const analysis = data.analysis;

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-slate-900 mb-2">No analysis available</p>
          <p className="text-sm text-slate-600 mb-4">This article hasn&apos;t been analyzed yet. Process it first to see the interactive viewer.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ArticleViewer
      articleId={data.article_id}
      wordCount={data.word_count}
      tlDr={analysis.summary.tl_dr}
      keyTakeaways={analysis.summary.key_takeaways}
      sections={analysis.sections}
      conceptMap={analysis.concept_map}
      glossary={analysis.glossary}
    />
  );
}
