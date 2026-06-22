const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = BACKEND_URL ? `${BACKEND_URL}${path}` : path;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let message: string;
      try {
        const body = await response.json();
        message = body.detail || `HTTP ${response.status}`;
      } catch {
        message = `HTTP ${response.status} ${response.statusText}`;
      }
      throw new ApiError(message, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const networkMessage = `Network error: unable to reach ${url}`;
    throw new Error(networkMessage);
  }
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T, B = unknown>(path: string, body: B): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export class UploadResponse {
  article_id: string;
  paragraphs: string[];
  word_count: number;

  constructor(data: UploadResponse) {
    this.article_id = data.article_id;
    this.paragraphs = data.paragraphs;
    this.word_count = data.word_count;
  }
}

export async function uploadArticle(
  type: "text" | "url" | "pdf" | "docx",
  text?: string,
  articleUrl?: string,
  file?: File | null
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("type", type);

  if (text) {
    formData.append("text", text);
  }
  if (articleUrl) {
    formData.append("url", articleUrl);
  }
  if (file) {
    formData.append("file", file);
  }

  const endpoint = BACKEND_URL ? `${BACKEND_URL}/api/upload` : "/api/upload";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let message: string;
      try {
        const body = await response.json();
        message = body.detail || `HTTP ${response.status}`;
      } catch {
        message = `HTTP ${response.status} ${response.statusText}`;
      }
      throw new ApiError(message, response.status);
    }

    const data = await response.json();
    return new UploadResponse(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const networkMessage = `Network error: unable to reach ${endpoint}`;
    throw new Error(networkMessage);
  }
}

export class LLMSettings {
  provider: string;
  api_key: string;
  base_url: string;

  constructor(data: LLMSettings) {
    this.provider = data.provider;
    this.api_key = data.api_key;
    this.base_url = data.base_url;
  }
}

export class LLMResponseData {
  content: string;
  model: string;
  usage_tokens_prompt: number;
  usage_tokens_completion: number;

  constructor(data: LLMResponseData) {
    this.content = data.content;
    this.model = data.model;
    this.usage_tokens_prompt = data.usage_tokens_prompt;
    this.usage_tokens_completion = data.usage_tokens_completion;
  }
}

export async function saveLlmSettings(settings: {
  provider: string;
  api_key: string;
  base_url: string;
}): Promise<LLMSettings> {
  const data = await apiPost<LLMSettings, { provider: string; api_key: string; base_url: string }>(
    "/api/settings/llm",
    settings
  );
  return new LLMSettings(data);
}

export async function getLlmSettings(): Promise<LLMSettings> {
  const data = await apiGet<LLMSettings>("/api/settings/llm");
  return new LLMSettings(data);
}

export async function clearLlmSettings(): Promise<void> {
  const endpoint = BACKEND_URL ? `${BACKEND_URL}/api/settings/llm` : "/api/settings/llm";
  await fetch(endpoint, { method: "DELETE" });
}

export async function checkOllama(): Promise<{ available: boolean }> {
  const endpoint = BACKEND_URL ? `${BACKEND_URL}/api/settings/ollama/check` : "/api/settings/ollama/check";
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new ApiError("Failed to check Ollama", response.status);
  }
  return await response.json();
}

export class Section {
  id: string;
  heading: string;
  content: string;
  order: number;

  constructor(data: Section) {
    this.id = data.id;
    this.heading = data.heading;
    this.content = data.content;
    this.order = data.order;
  }
}

export class ConceptNode {
  id: string;
  label: string;
  category: string;

  constructor(data: ConceptNode) {
    this.id = data.id;
    this.label = data.label;
    this.category = data.category;
  }
}

export class ConceptEdge {
  from_node: string;
  to_node: string;
  label: string;

  constructor(data: ConceptEdge) {
    this.from_node = data.from_node;
    this.to_node = data.to_node;
    this.label = data.label;
  }
}

export class ConceptMap {
  nodes: ConceptNode[];
  edges: ConceptEdge[];

  constructor(data: ConceptMap) {
    this.nodes = data.nodes.map((n) => new ConceptNode(n));
    this.edges = data.edges.map((e) => new ConceptEdge(e));
  }
}

export class GlossaryEntry {
  term: string;
  definition: string;
  context: string;

  constructor(data: GlossaryEntry) {
    this.term = data.term;
    this.definition = data.definition;
    this.context = data.context;
  }
}

export class Summary {
  tl_dr: string;
  key_takeaways: string[];

  constructor(data: Summary) {
    this.tl_dr = data.tl_dr;
    this.key_takeaways = data.key_takeaways;
  }
}

export class AnalysisResponse {
  sections: Section[];
  concept_map: ConceptMap;
  glossary: GlossaryEntry[];
  summary: Summary;

  constructor(data: AnalysisResponse) {
    this.sections = data.sections.map((s) => new Section(s));
    this.concept_map = new ConceptMap(data.concept_map);
    this.glossary = data.glossary.map((g) => new GlossaryEntry(g));
    this.summary = new Summary(data.summary);
  }
}

export async function processArticle(
  articleId: string,
  paragraphs: string[],
  provider: string,
  apiKey: string,
  baseUrl: string = "",
  model: string = ""
): Promise<AnalysisResponse> {
  const data = await apiPost<AnalysisResponse, {
    article_id: string;
    paragraphs: string[];
    provider: string;
    api_key: string;
    base_url: string;
    model: string;
  }>(
    "/api/process?sync=true",
    { article_id: articleId, paragraphs, provider, api_key: apiKey, base_url: baseUrl, model }
  );
  return new AnalysisResponse(data);
}

export interface ArticleResult {
  article_id: string;
  word_count: number;
  analysis?: AnalysisResponse;
}

export async function getArticle(articleId: string): Promise<ArticleResult> {
  const endpoint = BACKEND_URL ? `${BACKEND_URL}/api/articles/${articleId}` : `/api/articles/${articleId}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    let message: string;
    try {
      const body = await response.json();
      message = body.detail || `HTTP ${response.status}`;
    } catch {
      message = `HTTP ${response.status} ${response.statusText}`;
    }
    throw new ApiError(message, response.status);
  }

  const data = await response.json();
  return {
    article_id: data.article_id,
    word_count: data.word_count,
    analysis: data.analysis ? new AnalysisResponse(data.analysis) : undefined,
  };
}

