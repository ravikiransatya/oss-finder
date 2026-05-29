from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.bookmark import Bookmark
from models.user import User
from routes.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class BookmarkCreate(BaseModel):
    issue_id:    int
    issue_url:   str
    issue_title: str
    repo_name:   str
    collection:  Optional[str] = "default"

class BookmarkUpdate(BaseModel):
    status:     Optional[str] = None   # saved/applied/solved
    collection: Optional[str] = None

def bookmark_to_dict(b: Bookmark) -> dict:
    return {
        "id":          b.id,
        "issue_id":    b.issue_id,
        "issue_url":   b.issue_url,
        "issue_title": b.issue_title,
        "repo_name":   b.repo_name,
        "status":      b.status,
        "collection":  b.collection,
        "saved_at":    b.saved_at.isoformat() if b.saved_at else None,
    }

@router.get("/bookmarks")
def list_bookmarks(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    items = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).order_by(Bookmark.saved_at.desc()).all()
    return [bookmark_to_dict(b) for b in items]

@router.post("/bookmarks")
def add_bookmark(
    body:         BookmarkCreate,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    existing = db.query(Bookmark).filter(
        Bookmark.user_id  == current_user.id,
        Bookmark.issue_id == body.issue_id,
    ).first()
    if existing:
        return bookmark_to_dict(existing)

    bm = Bookmark(
        user_id    = current_user.id,
        issue_id   = body.issue_id,
        issue_url  = body.issue_url,
        issue_title= body.issue_title,
        repo_name  = body.repo_name,
        collection = body.collection or "default",
        status     = "saved",
    )
    db.add(bm)
    db.commit()
    db.refresh(bm)
    return bookmark_to_dict(bm)

@router.put("/bookmarks/{bookmark_id}")
def update_bookmark(
    bookmark_id:  int,
    body:         BookmarkUpdate,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    bm = db.query(Bookmark).filter(
        Bookmark.id      == bookmark_id,
        Bookmark.user_id == current_user.id,
    ).first()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    if body.status     is not None: bm.status     = body.status
    if body.collection is not None: bm.collection = body.collection
    db.commit()
    db.refresh(bm)
    return bookmark_to_dict(bm)

from pydantic import BaseModel
from typing import Optional, List

class BookmarkIds(BaseModel):
    ids: List[int]

@router.delete("/bookmarks/bulk")
def delete_bookmarks_bulk(
    body:         BookmarkIds,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    db.query(Bookmark).filter(
        Bookmark.id.in_(body.ids),
        Bookmark.user_id == current_user.id,
    ).delete(synchronize_session=False)
    db.commit()
    return {"deleted": len(body.ids)}

@router.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(
    bookmark_id:  int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    bm = db.query(Bookmark).filter(
        Bookmark.id      == bookmark_id,
        Bookmark.user_id == current_user.id,
    ).first()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(bm)
    db.commit()
    return {"deleted": True}
