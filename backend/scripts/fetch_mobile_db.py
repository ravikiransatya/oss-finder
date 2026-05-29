"""
Fetch mobile-specific issues from popular mobile repositories
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import httpx
from datetime import datetime
from database import SessionLocal
from models.issue import Issue
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
}

# Mobile-focused repositories
MOBILE_REPOS = [
    "flutter/flutter",
    "facebook/react-native", 
    "ionic-team/ionic-framework",
    "xamarin/xamarin-forms",
    "apache/cordova",
    "nativescript/nativescript",
    "expo/expo",
    "microsoft/react-native-windows",
]

# Database-focused repositories  
DATABASE_REPOS = [
    "postgres/postgres",
    "mongodb/mongo",
    "redis/redis",
    "elastic/elasticsearch",
    "supabase/supabase",
    "prisma/prisma",
]

BEGINNER_LABELS = [
    "good first issue", "good-first-issue", "beginner", "beginner-friendly", 
    "starter", "easy", "hacktoberfest",
]

def compute_difficulty(labels: list[str]) -> str:
    labels_lower = [l.lower() for l in labels]
    for bl in BEGINNER_LABELS:
        if bl in labels_lower:
            return "beginner"
    if any(x in labels_lower for x in ["advanced", "hard", "complex", "expert"]):
        return "advanced"
    return "intermediate"

def fetch_repo_info(owner_repo: str) -> dict:
    url = f"https://api.github.com/repos/{owner_repo}"
    try:
        r = httpx.get(url, headers=HEADERS, timeout=15)
        return r.json() if r.status_code == 200 else {}
    except:
        return {}

def fetch_issues_for_repo(owner_repo: str, per_page: int = 15) -> list:
    url = f"https://api.github.com/repos/{owner_repo}/issues?state=open&per_page={per_page}&sort=created&direction=desc"
    try:
        r = httpx.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            print(f"  [WARN] {owner_repo}: HTTP {r.status_code}")
            return []
        return [i for i in r.json() if "pull_request" not in i]
    except Exception as e:
        print(f"  [ERROR] {owner_repo}: {e}")
        return []

def main():
    db = SessionLocal()
    total_saved = 0
    
    all_repos = MOBILE_REPOS + DATABASE_REPOS

    for repo_path in all_repos:
        print(f"Fetching {repo_path} ...")
        repo_data = fetch_repo_info(repo_path)
        issues_raw = fetch_issues_for_repo(repo_path)

        language = repo_data.get("language", "") or ""
        saved = 0
        
        for gh_issue in issues_raw:
            github_id = gh_issue["id"]
            existing = db.query(Issue).filter(Issue.github_id == github_id).first()
            if existing:
                continue

            labels = [l["name"] for l in gh_issue.get("labels", [])]
            labels_str = ", ".join(labels)
            created_str = gh_issue.get("created_at", "")
            created_dt = None
            if created_str:
                try:
                    created_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                except:
                    pass

            issue = Issue(
                github_id=github_id,
                title=gh_issue["title"][:500],
                body=(gh_issue.get("body") or "")[:5000],
                url=gh_issue["html_url"],
                repo_name=repo_path,
                labels=labels_str,
                state=gh_issue.get("state", "open"),
                language=language,
                stars=repo_data.get("stargazers_count", 0),
                forks=repo_data.get("forks_count", 0),
                comment_count=gh_issue.get("comments", 0),
                difficulty=compute_difficulty(labels),
                quality_score=min(repo_data.get("stargazers_count", 0) / 1000, 100),
                created_at=created_dt,
            )
            db.add(issue)
            saved += 1

        try:
            db.commit()
            total_saved += saved
            print(f"  Saved {saved} new issues")
        except Exception as e:
            print(f"  [ERROR] Failed to save: {e}")
            db.rollback()

    print(f"\nTotal saved: {total_saved}")
    db.close()

if __name__ == "__main__":
    main()