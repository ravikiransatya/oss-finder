from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.issue import Issue
from pydantic import BaseModel
from typing import List, Optional
import json, math

router = APIRouter()

# ─── tiny cosine similarity (no numpy required) ───────────────────────────────
def cosine(a: List[float], b: List[float]) -> float:
    dot  = sum(x * y for x, y in zip(a, b))
    norm = math.sqrt(sum(x**2 for x in a)) * math.sqrt(sum(x**2 for x in b))
    return dot / norm if norm else 0.0

class SemanticSearchRequest(BaseModel):
    query:       str
    limit:       Optional[int] = 10
    language:    Optional[str] = None
    difficulty:  Optional[str] = None

@router.post("/semantic-search")
def semantic_search(body: SemanticSearchRequest, db: Session = Depends(get_db)):
    """
    Semantic search using stored embeddings.
    Requires sentence-transformers to be installed and embeddings pre-computed.
    Falls back to keyword search if embeddings unavailable.
    """
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        query_vec = model.encode(body.query).tolist()
        use_semantic = True
    except ImportError:
        use_semantic = False

    q = db.query(Issue).filter(Issue.state == "open")
    if body.language:
        q = q.filter(Issue.language.ilike(f"%{body.language}%"))
    if body.difficulty:
        q = q.filter(Issue.difficulty == body.difficulty)

    issues = q.all()

    if use_semantic:
        scored = []
        for issue in issues:
            if issue.embedding:
                try:
                    vec = json.loads(issue.embedding)
                    score = cosine(query_vec, vec)
                    scored.append((score, issue))
                except Exception:
                    pass
        scored.sort(key=lambda x: x[0], reverse=True)
        results = [i for _, i in scored[:body.limit]]
    else:
        # keyword fallback
        term = body.query.lower()
        results = [
            i for i in issues
            if term in (i.title or "").lower() or term in (i.body or "").lower()
        ][:body.limit]

    return {
        "query":   body.query,
        "mode":    "semantic" if use_semantic else "keyword",
        "results": [
            {
                "id":           i.id,
                "title":        i.title,
                "url":          i.url,
                "repo":         i.repo_name,
                "labels":       [l.strip() for l in (i.labels or "").split(",") if l.strip()],
                "language":     i.language,
                "stars":        i.stars,
                "difficulty":   i.difficulty,
                "quality_score":i.quality_score,
                "created_at":   i.created_at.isoformat() if i.created_at else None,
            }
            for i in results
        ],
    }

@router.get("/recommend")
def get_recommendations(
    skills:     str = "",
    experience: str = "beginner",
    limit:      int = 10,
    db:         Session = Depends(get_db),
):
    """Simple skill-based recommendation without ML."""
    skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
    q = db.query(Issue).filter(Issue.state == "open")

    if experience == "beginner":
        q = q.filter(Issue.difficulty == "beginner")

    issues = q.order_by(Issue.quality_score.desc()).limit(200).all()

    if skill_list:
        def relevance(issue):
            text = f"{issue.title} {issue.body} {issue.labels} {issue.language}".lower()
            return sum(1 for s in skill_list if s in text)

        issues = sorted(issues, key=relevance, reverse=True)

    return [
        {
            "id":           i.id,
            "title":        i.title,
            "url":          i.url,
            "repo":         i.repo_name,
            "labels":       [l.strip() for l in (i.labels or "").split(",") if l.strip()],
            "language":     i.language,
            "stars":        i.stars,
            "difficulty":   i.difficulty,
            "quality_score":i.quality_score,
            "created_at":   i.created_at.isoformat() if i.created_at else None,
        }
        for i in issues[:limit]
    ]
