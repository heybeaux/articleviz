"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, uploadArticle, processArticle, getLlmSettings, UploadResponse } from "@/lib/api";
import { InputTabs } from "@/components/upload/InputTabs";
import { UploadArea } from "@/components/upload/UploadArea";

interface HealthStatus {
  status: string;
}

type InputType = "text" | "url" | "pdf" | "docx";

interface ArticleEntry {
  article_id: string;
  word_count: number;
  has_analysis: boolean;
}

export default function Home() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleEntry[]>([]);

  const [activeTab, setActiveTab] = useState<InputType>("text");
  const [textContent, setTextContent] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const [processing, setProcessing] = useState(false);
  const [processedId, setProcessedId] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await apiGet<HealthStatus>("/api/health");
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
    checkHealth();
  }, []);

  useEffect(() => {
    setFileError(null);
    setSelectedFile(null);
  }, [activeTab]);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await apiGet<ArticleEntry[]>("/api/articles");
        setArticles(data);
      } catch {
        // Ignore errors when fetching articles list
      }
    }
    fetchArticles();
  }, [processedId]);

  const handleUpload = async () => {
    setError(null);
    setFileError(null);
    setResult(null);

    if (activeTab === "text" && !textContent.trim()) {
      setError("Please enter some text to upload.");
      return;
    }

    if (activeTab === "url" && !urlValue.trim()) {
      setError("Please enter a URL to fetch.");
      return;
    }

    if ((activeTab === "pdf" || activeTab === "docx") && !selectedFile) {
      setError(`Please select a ${activeTab.toUpperCase()} file to upload.`);
      return;
    }

    setUploading(true);

    try {
      let fileForUpload: File | null = null;
      if (activeTab === "pdf" || activeTab === "docx") {
        fileForUpload = selectedFile;
      }

      const data = await uploadArticle(
        activeTab,
        textContent || undefined,
        urlValue || undefined,
        fileForUpload
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!result) return;

    setError(null);
    setProcessing(true);

    try {
      const settings = await getLlmSettings();

      if (!settings.api_key && settings.provider !== "ollama") {
        setError("API key is not configured. Please set it in Settings.");
        return;
      }

      const analysis = await processArticle(
        result.article_id,
        result.paragraphs,
        settings.provider || "openai",
        settings.api_key,
        settings.base_url || "",
        ""
      );

      setProcessedId(result.article_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleViewArticle = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };

  const handleFileValidation = (file: File | null) => {
    if (!file) {
      setFileError(null);
      setSelectedFile(null);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== activeTab) {
      setFileError(`Expected .${activeTab} file, got .${ext || "unknown"}`);
      setSelectedFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`File is too large. Maximum size is 10 MB.`);
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">ArticleViz</h1>
          <p className="text-slate-600 mt-2">
            Transform articles into interactive visualizations
          </p>

          <div className="flex items-center justify-center gap-2 mt-4">
            {health ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Backend connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Backend disconnected
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <InputTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-6 space-y-4">
            {activeTab === "text" && (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your article text here..."
                rows={10}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            )}

            {activeTab === "url" && (
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            )}

            {(activeTab === "pdf" || activeTab === "docx") && (
              <UploadArea
                activeTab={activeTab}
                file={selectedFile}
                onFileSelect={handleFileValidation}
                onValidationError={setFileError}
                error={fileError}
              />
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              {uploading ? "Processing..." : "Upload Article"}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">
                Article ingested successfully
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-green-700">
                  Article ID: <code>{result.article_id}</code>
                </p>
                <p className="text-xs text-green-700">
                  Word count: {result.word_count}
                </p>
              </div>

              <button
                onClick={handleProcess}
                disabled={processing}
                className="mt-4 w-full py-2.5 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                {processing ? "Analyzing..." : "Analyze Article"}
              </button>

              <details className="mt-3">
                <summary className="text-xs text-green-600 cursor-pointer hover:text-green-800">
                  View extracted paragraphs
                </summary>
                <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                  {result.paragraphs.map((p, i) => (
                    <p key={i} className="text-xs text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          )}

          {processedId && (
            <button
              onClick={() => handleViewArticle(processedId)}
              className="mt-4 w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 text-sm transition-colors"
            >
              View Interactive Article →
            </button>
          )}
        </div>

        {articles.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Articles</h3>
            <div className="space-y-2">
              {articles.map((article) => (
                <button
                  key={article.article_id}
                  onClick={() => handleViewArticle(article.article_id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">{article.article_id.slice(0, 8)}</span>
                    <span className="text-xs text-slate-600">{article.word_count.toLocaleString()} words</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.has_analysis && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Analyzed
                      </span>
                    )}
                    <span className="text-xs text-slate-400">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
