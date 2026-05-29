"""
fetch_issues.py — fetch GitHub issues and save to PostgreSQL
Usage: python scripts/fetch_issues.py
"""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import httpx
from datetime import datetime
from database import SessionLocal
from models.issue import Issue
from models.repository import Repository
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
}

REPOS = [
    # JavaScript / TypeScript
    "facebook/react",
    "vercel/next.js",
    "microsoft/vscode",
    "tailwindlabs/tailwindcss",
    "vuejs/vue",
    "sveltejs/svelte",
    "vitejs/vite",
    "axios/axios",
    # Python
    "tiangolo/fastapi",
    "django/django",
    "pallets/flask",
    "psf/requests",
    "numpy/numpy",
    "pandas-dev/pandas",
    "scikit-learn/scikit-learn",
    # Go
    "golang/go",
    "gin-gonic/gin",
    "gofiber/fiber",
    # Rust
    "rust-lang/rust",
    "tokio-rs/tokio",
    # Java
    "spring-projects/spring-boot",
    # Other
    "supabase/supabase",
    "trpc/trpc",
    "prisma/prisma",
]

BEGINNER_LABELS = [
    "good first issue",
    "good-first-issue",
    "beginner",
    "beginner-friendly",
    "starter",
    "easy",
    "hacktoberfest",
]

def compute_difficulty(labels: list[str]) -> str:
    labels_lower = [l.lower() for l in labels]
    for bl in BEGINNER_LABELS:
        if bl in labels_lower:
            return "beginner"
    if any(x in labels_lower for x in ["advanced", "hard", "complex", "expert", "senior"]):
        return "advanced"
    if any(x in labels_lower for x in ["intermediate", "medium", "moderate"]):
        return "intermediate"
    # default based on comment count — more comments = more complex
    return "intermediate"

def compute_quality_score(repo_data: dict, issue_data: dict) -> float:
    score = 0.0
    stars = repo_data.get("stargazers_count", 0)
    score += min(stars / 10000, 1.0) * 30  # up to 30 pts for stars
    comments = issue_data.get("comments", 0)
    score += min(comments / 5, 1.0) * 20   # up to 20 pts for engagement
    # recency
    created_str = issue_data.get("created_at", "")
    if created_str:
        try:
            created = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            days_old = (datetime.now().astimezone() - created).days
            score += max(0, 50 - days_old * 0.5)  # up to 50 pts for recency
        except Exception:
            pass
    return round(min(score, 100.0), 2)

def fetch_repo_info(owner_repo: str) -> dict:
    url = f"https://api.github.com/repos/{owner_repo}"
    r = httpx.get(url, headers=HEADERS, timeout=15)
    return r.json() if r.status_code == 200 else {}

def fetch_issues_for_repo(owner_repo: str, per_page: int = 30) -> list:
    url = (
        f"https://api.github.com/repos/{owner_repo}/issues"
        f"?state=open&per_page={per_page}&sort=created&direction=desc"
    )
    r = httpx.get(url, headers=HEADERS, timeout=15)
    if r.status_code != 200:
        print(f"  [WARN] {owner_repo}: HTTP {r.status_code}")
        return []
    return [i for i in r.json() if "pull_request" not in i]  # skip PRs

def main():
    db = SessionLocal()
    total_saved = 0

    for repo_path in REPOS:
        print(f"Fetching {repo_path} ...")
        repo_data  = fetch_repo_info(repo_path)
        issues_raw = fetch_issues_for_repo(repo_path)

        # upsert Repository
        language = repo_data.get("language", "") or ""
        existing_repo = db.query(Repository).filter(Repository.repo_name == repo_path).first()
        if not existing_repo:
            existing_repo = Repository(repo_name=repo_path)
            db.add(existing_repo)
        existing_repo.language           = language
        existing_repo.stars              = repo_data.get("stargazers_count", 0)
        existing_repo.forks              = repo_data.get("forks_count", 0)
        existing_repo.description        = (repo_data.get("description") or "")[:500]
        existing_repo.open_issues_count  = repo_data.get("open_issues_count", 0)
        existing_repo.quality_score      = min(repo_data.get("stargazers_count", 0) / 1000, 100)
        existing_repo.beginner_friendly  = 0.8  # placeholder

        saved = 0
        for gh_issue in issues_raw:
            github_id = gh_issue["id"]
            existing  = db.query(Issue).filter(Issue.github_id == github_id).first()
            if existing:
                continue

            labels = [l["name"] for l in gh_issue.get("labels", [])]
            labels_str = ", ".join(labels)
            created_str = gh_issue.get("created_at", "")
            created_dt  = None
            if created_str:
                try:
                    created_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                except Exception:
                    pass

            issue = Issue(
                github_id     = github_id,
                title         = gh_issue["title"][:500],
                body          = (gh_issue.get("body") or "")[:5000],
                url           = gh_issue["html_url"],
                repo_name     = repo_path,
                labels        = labels_str,
                state         = gh_issue.get("state", "open"),
                language      = language,
                stars         = repo_data.get("stargazers_count", 0),
                forks         = repo_data.get("forks_count", 0),
                comment_count = gh_issue.get("comments", 0),
                difficulty    = compute_difficulty(labels),
                quality_score = compute_quality_score(repo_data, gh_issue),
                created_at    = created_dt,
            )
            db.add(issue)
            saved += 1

        db.commit()
        total_saved += saved
        print(f"  Saved {saved} new issues")

    print(f"\nTotal saved: {total_saved}")
    db.close()

if __name__ == "__main__":
    main()
