from typing import Literal

from pydantic import BaseModel, Field, field_validator

Provider = Literal["openai", "anthropic", "openrouter", "ollama", "omxl"]


class HealthResponse(BaseModel):
    status: str


class UploadRequest(BaseModel):
    type: str
    text: str | None = None
    url: str | None = None


class UploadResponse(BaseModel):
    article_id: str
    paragraphs: list[str]
    word_count: int


class LLMSettingsRequest(BaseModel):
    provider: str = "openai"
    api_key: str = ""
    base_url: str = ""


class LLMSettingsResponse(BaseModel):
    provider: str
    api_key: str = ""
    base_url: str = ""


class LLMResponse(BaseModel):
    content: str
    model: str = ""
    usage_tokens_prompt: int = 0
    usage_tokens_completion: int = 0


class ProcessRequest(BaseModel):
    article_id: str
    paragraphs: list[str]
    provider: Provider = "openai"
    api_key: str = ""
    base_url: str = ""
    model: str = ""


class ProcessResponse(BaseModel):
    llm_response: LLMResponse


class Section(BaseModel):
    id: str = Field(description="Unique identifier for the section")
    heading: str = Field(description="Descriptive heading for this section")
    content: str = Field(description="Concise 2-4 sentence summary of the section (not verbatim source text)")
    order: int = Field(description="Order of this section in the article")

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, value):
        return str(value)


class ConceptNode(BaseModel):
    id: str = Field(description="Unique identifier for this node")
    label: str = Field(description="Short label for the concept (2-5 words)")
    category: str = Field(description="Category or type of this concept")

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, value):
        return str(value)


class ConceptEdge(BaseModel):
    from_node: str = Field(description="ID of the source node")
    to_node: str = Field(description="ID of the target node")
    label: str = Field(description="Description of the relationship between nodes")

    @field_validator("from_node", "to_node", mode="before")
    @classmethod
    def coerce_node_ids(cls, value):
        return str(value)


class ConceptMap(BaseModel):
    nodes: list[ConceptNode] = Field(description="Key concepts as nodes in the concept map")
    edges: list[ConceptEdge] = Field(description="Relationships between concepts")


class GlossaryEntry(BaseModel):
    term: str = Field(description="The key term or phrase")
    definition: str = Field(description="Definition of the term, based on its context in the article")
    context: str = Field(description="How this term is used in the article (short excerpt)")


class Summary(BaseModel):
    tl_dr: str = Field(description="One-paragraph TL;DR summary of the entire article")
    key_takeaways: list[str] = Field(description="3-5 key takeaways from the article")


class AnalysisResponse(BaseModel):
    sections: list[Section] = Field(description="Article split into digestible sections")
    concept_map: ConceptMap = Field(description="Key concepts and their relationships")
    glossary: list[GlossaryEntry] = Field(description="Domain-specific terms with definitions")
    summary: Summary = Field(description="TL;DR and key takeaways")


StageStatus = Literal["pending", "running", "complete", "failed"]
JobStatus = Literal["pending", "running", "partial", "complete", "failed"]


class StageState(BaseModel):
    status: StageStatus = "pending"
    attempts: int = Field(default=0, description="Number of attempts made for this stage")
    error: str | None = Field(default=None, description="Error message if this stage failed")


class JobStages(BaseModel):
    sections: StageState = Field(default_factory=StageState)
    concept_map: StageState = Field(default_factory=StageState)
    glossary: StageState = Field(default_factory=StageState)
    summary: StageState = Field(default_factory=StageState)


class JobPartialResults(BaseModel):
    sections: list[Section] | None = None
    concept_map: ConceptMap | None = None
    glossary: list[GlossaryEntry] | None = None
    summary: Summary | None = None


class JobStatusResponse(BaseModel):
    job_id: str = Field(description="Unique identifier for this analysis job")
    article_id: str = Field(description="Article this job is analyzing")
    status: JobStatus = Field(default="pending", description="Overall job status")
    stages: JobStages = Field(default_factory=JobStages, description="Per-stage status and error info")
    results: JobPartialResults = Field(default_factory=JobPartialResults, description="Partial results as each stage lands")
    error: str | None = Field(default=None, description="Job-level error if the job failed catastrophically")
