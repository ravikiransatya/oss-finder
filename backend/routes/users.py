from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.bookmark import Bookmark
from routes.auth import get_current_user, user_to_dict
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class UpdateProfileRequest(BaseModel):
    name:       Optional[str] = None
    bio:        Optional[str] = None
    skills:     Optional[List[str]] = None
    experience: Optional[str] = None

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
    db.commit()
    db.refresh(current_user)
    return user_to_dict(current_user)

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
        "saved":         saved,
        "applied":       applied,
        "solved":        solved,
        "total":         len(bookmarks),
        "streak_days":   current_user.streak_days,
        "contributions": current_user.contributions,
    }
