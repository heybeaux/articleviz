import asyncio
import uuid

from fastapi import APIRouter, HTTPException, Response

from app.models import (
    AnalysisResponse,
    JobStatusResponse,
    ProcessRequest,
)
from app.services.llm import LLMClient, LLMClientConfig
from app.services.visualizer import Visualizer, retry_async
from app.routes.articles import ArticleStore

router = APIRouter()


class JobStore:
    _jobs: dict[str, JobStatusResponse] = {}
    _tasks: set[asyncio.Task] = set()

    @classmethod
    def create(cls, article_id: str) -> JobStatusResponse:
        job_id = str(uuid.uuid4())
        job = JobStatusResponse(job_id=job_id, article_id=article_id, status="pending")
        cls._jobs[job_id] = job
        return job

    @classmethod
    def get(cls, job_id: str) -> JobStatusResponse | None:
        return cls._jobs.get(job_id)

    @classmethod
    def track_task(cls, task: asyncio.Task) -> None:
        cls._tasks.add(task)
        task.add_done_callback(cls._tasks.discard)


async def _run_stage(job: JobStatusResponse, stage_name: str, result_name: str, func) -> bool:
    stage = getattr(job.stages, stage_name)
    stage.status = "running"

    def _record(attempt: int) -> None:
        stage.attempts = attempt

    try:
        result = await retry_async(func, on_attempt=_record)
    except Exception as exc:
        stage.status = "failed"
        stage.error = str(exc)
        return False

    stage.status = "complete"
    setattr(job.results, result_name, result)
    return True


async def run_job(job: JobStatusResponse, article_text: str, visualizer: Visualizer) -> None:
    job.status = "running"

    stages = [
        ("sections", "sections", lambda: visualizer.analyze_sections(article_text)),
        ("concept_map", "concept_map", lambda: visualizer.analyze_concept_map(article_text)),
        ("glossary", "glossary", lambda: visualizer.analyze_glossary(article_text)),
        ("summary", "summary", lambda: visualizer.analyze_summary(article_text)),
    ]

    try:
        outcomes = [
            await _run_stage(job, stage_name, result_name, func)
            for stage_name, result_name, func in stages
        ]
    except Exception as exc:
        job.status = "failed"
        job.error = str(exc)
        return

    succeeded = sum(1 for ok in outcomes if ok)

    if succeeded == len(stages):
        job.status = "complete"
        analysis = AnalysisResponse(
            sections=job.results.sections,
            concept_map=job.results.concept_map,
            glossary=job.results.glossary,
            summary=job.results.summary,
        )
        ArticleStore.save_analysis(job.article_id, analysis.model_dump())
    elif succeeded == 0:
        job.status = "failed"
    else:
        job.status = "partial"


def _build_visualizer(request: ProcessRequest) -> Visualizer:
    config = LLMClientConfig(
        provider=request.provider,
        api_key=request.api_key,
        base_url=request.base_url,
        model=request.model,
    )
    return Visualizer(LLMClient(config))


@router.post("/api/process")
async def process_article(request: ProcessRequest, response: Response, sync: bool = False):
    if not request.paragraphs:
        raise HTTPException(status_code=400, detail="Article paragraphs are required")

    if request.provider not in {"ollama", "omxl"} and not request.api_key:
        raise HTTPException(status_code=400, detail="API key is required for LLM calls")

    article_text = "\n\n".join(request.paragraphs)
    visualizer = _build_visualizer(request)

    if sync:
        try:
            analysis = await visualizer.analyze_article(article_text)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Analysis failed: {str(e)}")

        ArticleStore.save_analysis(request.article_id, analysis.model_dump())
        return analysis

    job = JobStore.create(request.article_id)
    task = asyncio.create_task(run_job(job, article_text, visualizer))
    JobStore.track_task(task)

    response.status_code = 202
    return job


@router.get("/api/process/{job_id}", response_model=JobStatusResponse)
async def get_process_job(job_id: str):
    job = JobStore.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
