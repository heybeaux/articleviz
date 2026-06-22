import asyncio
import json
from typing import Awaitable, Callable, TypeVar

from app.models import (
    AnalysisResponse,
    ConceptMap,
    GlossaryEntry,
    Section,
    Summary,
)
from app.services.llm import LLMClient
from pydantic import TypeAdapter


section_list_adapter = TypeAdapter(list[Section])
glossary_list_adapter = TypeAdapter(list[GlossaryEntry])

T = TypeVar("T")


async def retry_async(
    func: Callable[[], Awaitable[T]],
    *,
    max_attempts: int = 3,
    base_delay: float = 0.5,
    on_attempt: Callable[[int], None] | None = None,
) -> T:
    last_exc: Exception | None = None

    for attempt in range(1, max_attempts + 1):
        if on_attempt is not None:
            on_attempt(attempt)
        try:
            return await func()
        except Exception as exc:
            last_exc = exc
            if attempt >= max_attempts:
                break
            await asyncio.sleep(base_delay * (2 ** (attempt - 1)))

    assert last_exc is not None
    raise last_exc


def parse_json_content(content: str):
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```json").removeprefix("```").strip()
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        decoder = json.JSONDecoder()
        start_candidates = [idx for idx in (cleaned.find("["), cleaned.find("{")) if idx >= 0]
        if not start_candidates:
            raise

        start = min(start_candidates)
        parsed, _ = decoder.raw_decode(cleaned[start:])
        return parsed


def ensure_list(value):
    return value if isinstance(value, list) else [value]


def unwrap_key(value, key: str):
    if isinstance(value, dict) and key in value:
        return value[key]
    return value


def unwrap_any_key(value, keys: tuple[str, ...]):
    if isinstance(value, dict):
        for key in keys:
            if key in value:
                return value[key]
    return value


def normalize_sections(value) -> list[dict]:
    sections = ensure_list(value)
    normalized = []

    for index, section in enumerate(sections, start=1):
        if not isinstance(section, dict):
            normalized.append(section)
            continue

        normalized_section = dict(section)
        normalized_section.setdefault("id", f"section-{index}")
        normalized_section.setdefault("order", index)
        normalized.append(normalized_section)

    return normalized


SECTION_BREAKDOWN_PROMPT = """You are analyzing an article to create digestible sections for readers. Your job is to split the content into logical, self-contained sections that each cover one main idea.

Rules:
- Each section's content should be a brief 2-4 sentence summary capturing the main idea, not the verbatim source text
- Include only a short representative quote/excerpt where helpful; do not reproduce full paragraphs
- Create clear, descriptive headings that tell the reader what each section covers
- Preserve the original meaning and flow of the article
- Aim for 4-8 sections total for a standard-length article
- Keep sections balanced — avoid one massive section and several tiny ones

Return your response as a JSON array of sections. Each section must have:
- id: a unique identifier (e.g., "section-1", "section-2")
- heading: a descriptive title for the section
- content: a concise 2-4 sentence summary of this section (NOT the full verbatim text)
- order: the position of this section in the article (starting from 1)

Article content:
{article_text}"""


CONCEPT_MAP_PROMPT = """You are analyzing an article to extract a concept map — a visual representation of the key ideas and how they relate to each other. Think of this as creating a mind map centered on the article's main topic.

Rules:
- Identify 5-12 key concepts from the article
- Each concept should have a short label (2-5 words)
- Categories can include: "main idea", "supporting concept", "example", "evidence", "methodology", "result", "definition"
- Create 5-15 edges showing relationships between concepts
- There should be a central/root concept that other ideas branch from
- Relationships should be directional and described clearly (e.g., "leads to", "is a type of", "supports")

Return your response as a JSON object with:
- nodes: array of {{id, label, category}}
- edges: array of {{from_node (ID), to_node (ID), label (relationship description)}}

Article content:
{article_text}"""


GLOSSARY_PROMPT = """You are analyzing an article to extract a glossary of domain-specific terms that might be unfamiliar to general readers. These are technical terms, jargon, specialized vocabulary, or concepts that benefit from a clear definition in context.

Rules:
- Extract 5-12 terms that would benefit from a definition
- Definitions should be based on how the term is used in THIS article (not generic dictionary definitions)
- Include a short excerpt showing how the term appears in context
- Keep definitions clear and accessible — imagine explaining to someone new to the topic

Return your response as a JSON array of glossary entries. Each entry must have:
- term: the key term or phrase
- definition: a clear, context-aware definition
- context: a short excerpt from the article showing how this term is used

Article content:
{article_text}"""


SUMMARY_PROMPT = """You are analyzing an article to create a concise TL;DR summary and key takeaways for quick comprehension.

Rules:
- The TL;DR should be one paragraph (3-5 sentences) that captures the essence of the entire article
- Extract 3-5 key takeaways — distinct, meaningful points a reader should remember
- Takeaways should be specific and substantive, not vague generalizations
- Focus on the most important information — what would someone miss if they only read the summary?

Return your response as a JSON object with:
- tl_dr: one paragraph summarizing the entire article
- key_takeaways: array of 3-5 specific, meaningful takeaways

Article content:
{article_text}"""


class Visualizer:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client

    async def analyze_sections(self, article_text: str) -> list[Section]:
        prompt = SECTION_BREAKDOWN_PROMPT.format(article_text=article_text)

        response = await self.llm_client.generate(
            prompt=prompt,
            system_prompt="You are an expert content analyst. Return ONLY valid JSON — no markdown formatting, no explanations, just the raw JSON response.",
            max_tokens=4096,
        )

        parsed = unwrap_key(parse_json_content(response.content), "sections")
        return section_list_adapter.validate_python(normalize_sections(parsed))

    async def analyze_concept_map(self, article_text: str) -> ConceptMap:
        prompt = CONCEPT_MAP_PROMPT.format(article_text=article_text)

        response = await self.llm_client.generate(
            prompt=prompt,
            system_prompt="You are an expert content analyst. Return ONLY valid JSON — no markdown formatting, no explanations, just the raw JSON response.",
            max_tokens=4096,
        )

        parsed = unwrap_key(parse_json_content(response.content), "concept_map")
        return ConceptMap.model_validate(parsed)

    async def analyze_glossary(self, article_text: str) -> list[GlossaryEntry]:
        prompt = GLOSSARY_PROMPT.format(article_text=article_text)

        response = await self.llm_client.generate(
            prompt=prompt,
            system_prompt="You are an expert content analyst. Return ONLY valid JSON — no markdown formatting, no explanations, just the raw JSON response.",
            max_tokens=4096,
        )

        parsed = unwrap_any_key(parse_json_content(response.content), ("glossary", "terms", "entries"))
        return glossary_list_adapter.validate_python(ensure_list(parsed))

    async def analyze_summary(self, article_text: str) -> Summary:
        prompt = SUMMARY_PROMPT.format(article_text=article_text)

        response = await self.llm_client.generate(
            prompt=prompt,
            system_prompt="You are an expert content analyst. Return ONLY valid JSON — no markdown formatting, no explanations, just the raw JSON response.",
            max_tokens=4096,
        )

        parsed = unwrap_key(parse_json_content(response.content), "summary")
        return Summary.model_validate(parsed)

    async def analyze_article(self, article_text: str) -> AnalysisResponse:
        sections = await self.analyze_sections(article_text)
        concept_map = await self.analyze_concept_map(article_text)
        glossary = await self.analyze_glossary(article_text)
        summary = await self.analyze_summary(article_text)

        return AnalysisResponse(
            sections=sections,
            concept_map=concept_map,
            glossary=glossary,
            summary=summary,
        )
