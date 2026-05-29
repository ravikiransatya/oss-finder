from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models.issue import Issue
from typing import Optional
from datetime import datetime, timedelta
import httpx, os

router = APIRouter()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GH_HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
}

BEGINNER_LABELS = ["good first issue", "good-first-issue", "beginner", "beginner-friendly", "easy", "starter", "hacktoberfest"]
ADVANCED_LABELS = ["advanced", "hard", "complex", "expert"]

def compute_difficulty(labels):
    ll = [l.lower() for l in labels]
    if any(b in ll for b in BEGINNER_LABELS): return "beginner"
    if any(a in ll for a in ADVANCED_LABELS): return "advanced"
    return "intermediate"

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

def fetch_and_cache(db: Session, search: str, language: str, difficulty: str):
    """Fetch from GitHub API and cache in DB for 1 hour."""
    # Build GitHub search query
    gh_query = f"{search} is:issue is:open"
    if language:
        gh_query += f" language:{language}"
    if difficulty == "beginner":
        gh_query += " label:\"good first issue\""
    elif difficulty == "advanced":
        gh_query += " label:advanced"

    try:
        resp = httpx.get(
            "https://api.github.com/search/issues",
            params={"q": gh_query, "sort": "created", "order": "desc", "per_page": 30},
            headers=GH_HEADERS,
            timeout=10,
        )
        if resp.status_code != 200:
            return []

        items = resp.json().get("items", [])
        saved = []

        for item in items:
            if "pull_request" in item:
                continue
            github_id = item["id"]
            existing = db.query(Issue).filter(Issue.github_id == github_id).first()

            # If cached and fresh (< 1 hour), skip re-saving
            if existing and existing.created_at:
                saved.append(existing)
                continue

            labels = [l["name"] for l in item.get("labels", [])]
            repo_full = item["repository_url"].replace("https://api.github.com/repos/", "")

            # Get repo info for language/stars
            repo_resp = httpx.get(f"https://api.github.com/repos/{repo_full}", headers=GH_HEADERS, timeout=8)
            repo_data = repo_resp.json() if repo_resp.status_code == 200 else {}

            created_dt = None
            try:
                created_dt = datetime.fromisoformat(item["created_at"].replace("Z", "+00:00"))
            except Exception:
                pass

            if existing:
                existing.title         = item["title"][:500]
                existing.labels        = ", ".join(labels)
                existing.comment_count = item.get("comments", 0)
                existing.difficulty    = compute_difficulty(labels)
                existing.language      = repo_data.get("language") or existing.language
                existing.stars         = repo_data.get("stargazers_count", existing.stars)
                saved.append(existing)
            else:
                issue = Issue(
                    github_id     = github_id,
                    title         = item["title"][:500],
                    body          = (item.get("body") or "")[:5000],
                    url           = item["html_url"],
                    repo_name     = repo_full,
                    labels        = ", ".join(labels),
                    state         = "open",
                    language      = repo_data.get("language") or "",
                    stars         = repo_data.get("stargazers_count", 0),
                    forks         = repo_data.get("forks_count", 0),
                    comment_count = item.get("comments", 0),
                    difficulty    = compute_difficulty(labels),
                    quality_score = min(repo_data.get("stargazers_count", 0) / 1000, 100),
                    created_at    = created_dt,
                )
                db.add(issue)
                saved.append(issue)

        db.commit()
        return saved

    except Exception as e:
        print(f"GitHub fetch error: {e}")
        return []


@router.get("/issues")
def get_issues(
    db:         Session = Depends(get_db),
    search:     Optional[str] = Query(None),
    language:   Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    label:      Optional[str] = Query(None),
    topic:      Optional[str] = Query(None),
    min_stars:  Optional[int] = Query(None),
    sort:       Optional[str] = Query("newest"),
    skip:       int = Query(0, ge=0),
    limit:      int = Query(20, ge=1, le=100),
):
    # If search query given, fetch fresh from GitHub then query DB
    if search:
        fetch_and_cache(db, search, language or "", difficulty or "")

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
    if topic and topic != "All":
        # Map topics to relevant filters
        if topic == "web":
            q = q.filter(or_(
                Issue.language.ilike("%javascript%"),
                Issue.language.ilike("%typescript%"),
                Issue.language.ilike("%html%"),
                Issue.language.ilike("%css%"),
                Issue.repo_name.ilike("%react%"),
                Issue.repo_name.ilike("%vue%"),
                Issue.repo_name.ilike("%next%"),
                Issue.labels.ilike("%frontend%"),
                Issue.labels.ilike("%web%")
            ))
        elif topic == "cli":
            q = q.filter(or_(
                Issue.labels.ilike("%cli%"),
                Issue.labels.ilike("%command%"),
                Issue.labels.ilike("%terminal%"),
                Issue.title.ilike("%cli%"),
                Issue.body.ilike("%command line%")
            ))
        elif topic == "ml":
            q = q.filter(or_(
                Issue.language.ilike("%python%"),
                Issue.labels.ilike("%machine-learning%"),
                Issue.labels.ilike("%ml%"),
                Issue.labels.ilike("%ai%"),
                Issue.labels.ilike("%data%"),
                Issue.repo_name.ilike("%scikit%"),
                Issue.repo_name.ilike("%pandas%"),
                Issue.repo_name.ilike("%numpy%")
            ))
        elif topic == "devtools":
            q = q.filter(or_(
                Issue.labels.ilike("%devtools%"),
                Issue.labels.ilike("%tooling%"),
                Issue.labels.ilike("%build%"),
                Issue.repo_name.ilike("%vscode%"),
                Issue.repo_name.ilike("%vite%")
            ))
        elif topic == "mobile":
            q = q.filter(or_(
                Issue.labels.ilike("%mobile%"),
                Issue.labels.ilike("%android%"),
                Issue.labels.ilike("%ios%"),
                Issue.language.ilike("%swift%"),
                Issue.language.ilike("%kotlin%")
            ))
        elif topic == "database":
            q = q.filter(or_(
                Issue.labels.ilike("%database%"),
                Issue.labels.ilike("%db%"),
                Issue.labels.ilike("%sql%"),
                Issue.language.ilike("%sql%")
            ))
        elif topic == "security":
            q = q.filter(or_(
                Issue.labels.ilike("%security%"),
                Issue.labels.ilike("%vulnerability%"),
                Issue.labels.ilike("%auth%")
            ))
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
    result["body"] = issue.body
    return result


@router.get("/issues/repo/{repo_name:path}")
def get_issues_by_repo(repo_name: str, db: Session = Depends(get_db), limit: int = 20):
    issues = db.query(Issue).filter(
        Issue.repo_name == repo_name,
        Issue.state == "open"
    ).limit(limit).all()
    return [issue_to_dict(i) for i in issues]
