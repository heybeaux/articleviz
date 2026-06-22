from fastapi import APIRouter, HTTPException

router = APIRouter()


class ArticleData:
    def __init__(self, article_id: str, paragraphs: list[str], word_count: int):
        self.article_id = article_id
        self.paragraphs = paragraphs
        self.word_count = word_count


class ArticleStore:
    _articles: dict[str, dict] = {}

    @classmethod
    def save_article(cls, article_id: str, paragraphs: list[str], word_count: int):
        cls._articles[article_id] = {
            "article": ArticleData(article_id, paragraphs, word_count),
            "analysis": None,
        }

    @classmethod
    def save_analysis(cls, article_id: str, analysis: dict):
        if article_id in cls._articles:
            cls._articles[article_id]["analysis"] = analysis

    @classmethod
    def get_article(cls, article_id: str) -> dict | None:
        return cls._articles.get(article_id)


@router.get("/api/articles/{article_id}")
async def get_article(article_id: str):
    data = ArticleStore.get_article(article_id)
    if not data:
        raise HTTPException(status_code=404, detail="Article not found")

    result = {
        "article_id": data["article"].article_id,
        "word_count": data["article"].word_count,
    }

    if data["analysis"]:
        result["analysis"] = data["analysis"]

    return result


@router.get("/api/articles")
async def list_articles():
    articles = []
    for article_id, data in ArticleStore._articles.items():
        articles.append({
            "article_id": data["article"].article_id,
            "word_count": data["article"].word_count,
            "has_analysis": data["analysis"] is not None,
        })
    return articles
