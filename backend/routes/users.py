from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.bookmark import Bookmark
from routes.auth import get_current_user, user_to_dict
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os

router = APIRouter()

class UpdateProfileRequest(BaseModel):
        name:       Optional[str] = None
        bio:        Optional[str] = None
        skills:     Optional[List[str]] = None
        experience: Optional[str] = None
        email:      Optional[str] = None
        location:   Optional[str] = None
        website:    Optional[str] = None

@router.get("/user/debug")
def debug_user(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "github_id": current_user.github_id,
        "github_url": current_user.github_url,
        "username": current_user.username,
        "email": current_user.email
    }

@router.get("/user/profile")
def get_profile(current_user: User = Depends(get_current_user)):
        return user_to_dict(current_user)

@router.put("/user/profile")
def update_profile(
        body:         UpdateProfileRequest,
        db:           Session = Depends(get_db),
        current_user: User    = Depends(get_current_user),
    ):
        if body.name       is not None: current_user.name       = body.name
        if body.bio        is not None: current_user.bio        = body.bio
        if body.skills     is not None: current_user.skills     = body.skills
        if body.experience is not None: current_user.experience = body.experience
        if body.email      is not None: current_user.email      = body.email
        if body.location   is not None: current_user.location   = body.location
        if body.website    is not None: current_user.website    = body.website
        db.commit()
        db.refresh(current_user)
        return user_to_dict(current_user)

@router.get("/user/github-repos")
async def get_github_repos(current_user: User = Depends(get_current_user)):
    if not current_user.github_url:
        raise HTTPException(status_code=400, detail="GitHub not connected")
    
    github_username = current_user.github_url.rstrip('/').split('/')[-1]
    print(f"Fetching repos for GitHub user: {github_username}")
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {}
            github_token = os.getenv('GITHUB_TOKEN', '')
            if github_token:
                headers["Authorization"] = f"token {github_token}"
            
            resp = await client.get(
                f"https://api.github.com/users/{github_username}/repos?sort=updated&per_page=10",
                headers=headers
            )
            
        print(f"GitHub API response status: {resp.status_code}")
        
        if resp.status_code == 404:
            return []  # User not found or no public repos
        
        if resp.status_code != 200:
            print(f"GitHub API error: {resp.text}")
            return []
            
        repos = resp.json()
        if not isinstance(repos, list):
            print(f"Unexpected GitHub API response: {repos}")
            return []
            
        result = [{
            "name": r["name"],
            "description": r.get("description") or "",
            "url": r["html_url"],
            "stars": r["stargazers_count"],
            "forks": r["forks_count"],
            "language": r.get("language") or "",
            "updated_at": r["updated_at"],
        } for r in repos]
        
        print(f"Returning {len(result)} repositories")
        return result
        
    except Exception as e:
        print(f"Error fetching GitHub repos: {e}")
        return []


@router.get("/user/stats")
def get_user_stats(
        db:           Session = Depends(get_db),
        current_user: User    = Depends(get_current_user),
    ):
        bookmarks = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).all()
        saved   = sum(1 for b in bookmarks if b.status == "saved")
        applied = sum(1 for b in bookmarks if b.status == "applied")
        solved  = sum(1 for b in bookmarks if b.status == "solved")
        return {
            "totalBookmarks": len(bookmarks),
            "appliedIssues":  applied,
            "solvedIssues":   solved,
            "streak":         current_user.streak_days or 0,
            "contributions": current_user.contributions or 0,
        }
