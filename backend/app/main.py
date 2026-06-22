import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ArticleViz API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok"}


@app.get("/api/health", response_model=HealthResponse)
async def api_health_check():
    return {"status": "ok"}


from app.routes.upload import router as upload_router
from app.routes.settings import router as settings_router
from app.routes.process import router as process_router
from app.routes.articles import router as articles_router

app.include_router(upload_router)
app.include_router(settings_router)
app.include_router(process_router)
app.include_router(articles_router)
