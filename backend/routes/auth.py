from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
import httpx
import os
import jwt
import json

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timedelta

router = APIRouter()

GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
JWT_SECRET           = os.getenv("JWT_SECRET", "change-this-secret-in-production")
JWT_ALGORITHM        = "HS256"
JWT_EXPIRE_DAYS      = 30

def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header[7:]
    user_id = verify_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/auth/github")
def github_login():
    """Returns GitHub OAuth URL for the frontend to redirect to."""
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&scope=read:user,user:email"
        f"&prompt=consent"
    )
    return {"url": url}

@router.get("/auth/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """Exchange code for access token, fetch user, return JWT."""
    if not GITHUB_CLIENT_ID:
        # Demo mode — return a mock user token for testing
        demo_user = db.query(User).filter(User.github_id == 999999).first()
        if not demo_user:
            demo_user = User(
                github_id=999999,
                username="demo_user",
                name="Demo Developer",
                avatar="https://avatars.githubusercontent.com/u/583231",
                bio="Building great open source!",
                email="demo@ossfinder.dev",
                github_url="https://github.com/octocat",
                skills=["JavaScript", "Python", "React"],
                experience="intermediate",
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        token = create_token(demo_user.id)
        return {"access_token": token, "user": user_to_dict(demo_user)}

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id":     GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code":          code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get GitHub token")

        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"},
        )
        gh_user = user_resp.json()

    db_user = db.query(User).filter(User.github_id == gh_user["id"]).first()
    if not db_user:
        db_user = User(
            github_id  = gh_user["id"],
            username   = gh_user.get("login", ""),
            name       = gh_user.get("name", "") or "",
            avatar     = gh_user.get("avatar_url", ""),
            bio        = gh_user.get("bio", "") or "",
            email      = gh_user.get("email", "") or "",
            github_url = gh_user.get("html_url", ""),
            skills     = [],
            experience = "beginner",
        )
        db.add(db_user)
    else:
        db_user.avatar = gh_user.get("avatar_url", db_user.avatar)
        db_user.name   = gh_user.get("name", db_user.name) or db_user.name
        db_user.last_login = datetime.utcnow()

    db.commit()
    db.refresh(db_user)
    jwt_token = create_token(db_user.id)
    return {"access_token": jwt_token, "user": user_to_dict(db_user)}

def user_to_dict(user: User) -> dict:
    return {
        "id":           user.id,
        "github_id":    user.github_id,
        "username":     user.username,
        "name":         user.name,
        "avatar":       user.avatar,
        "bio":          user.bio,
        "email":        user.email,
        "github_url":   user.github_url,
        "skills":       user.skills or [],
        "experience":   user.experience,
        "streak_days":  user.streak_days,
        "contributions":user.contributions,
        "created_at":   user.created_at.isoformat() if user.created_at else None,
        "last_login":   user.last_login.isoformat() if user.last_login else None,
    }
