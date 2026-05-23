from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from database import get_db
from models.issue import Issue
from typing import Optional, List
import json

router = APIRouter()

def issue_to_dict(issue: Issue) -> dict:
    return {
        "id":            issue.id,
        "github_id":     issue.github_id,
        "title":         issue.title,
        "body":          (issue.body or "")[:300],
        "url":           issue.url,
        "repo":          issue.repo_name,
        "labels":        [l.strip() for l in (issue.labels or "").split(",") if l.strip()],
        "state":         issue.state,
        "language":      issue.language,
        "stars":         issue.stars,
        "forks":         issue.forks,
        "comment_count": issue.comment_count,
        "difficulty":    issue.difficulty,
        "quality_score": issue.quality_score,
        "created_at":    issue.created_at.isoformat() if issue.created_at else None,
    }

@router.get("/issues")
def get_issues(
    db:         Session = Depends(get_db),
    search:     Optional[str] = Query(None),
    language:   Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    label:      Optional[str] = Query(None),
    min_stars:  Optional[int] = Query(None),
    sort:       Optional[str] = Query("newest"),  # newest, stars, quality
    skip:       int = Query(0, ge=0),
    limit:      int = Query(20, ge=1, le=100),
):
    q = db.query(Issue).filter(Issue.state == "open")

    if search:
        term = f"%{search}%"
        q = q.filter(or_(
            Issue.title.ilike(term),
            Issue.body.ilike(term),
            Issue.repo_name.ilike(term),
            Issue.labels.ilike(term),
        ))
    if language:
        q = q.filter(Issue.language.ilike(f"%{language}%"))
    if difficulty:
        q = q.filter(Issue.difficulty == difficulty)
    if label:
        q = q.filter(Issue.labels.ilike(f"%{label}%"))
    if min_stars is not None:
        q = q.filter(Issue.stars >= min_stars)

    if sort == "stars":
        q = q.order_by(Issue.stars.desc())
    elif sort == "quality":
        q = q.order_by(Issue.quality_score.desc())
    else:
        q = q.order_by(Issue.created_at.desc())

    total = q.count()
    results = q.offset(skip).limit(limit).all()

    return {
        "total":   total,
        "skip":    skip,
        "limit":   limit,
        "results": [issue_to_dict(i) for i in results],
    }

@router.get("/issues/{issue_id}")
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Issue not found")
    result = issue_to_dict(issue)
    result["body"] = issue.body  # full body for detail view
    return result

@router.get("/issues/repo/{repo_name:path}")
def get_issues_by_repo(repo_name: str, db: Session = Depends(get_db), limit: int = 20):
    issues = db.query(Issue).filter(
        Issue.repo_name == repo_name,
        Issue.state == "open"
    ).limit(limit).all()
    return [issue_to_dict(i) for i in issues]
