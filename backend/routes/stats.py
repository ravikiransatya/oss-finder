from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.issue import Issue
from models.user import User

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_issues = db.query(func.count(Issue.id)).filter(Issue.state == "open").scalar() or 0
    total_repos  = db.query(func.count(func.distinct(Issue.repo_name))).scalar() or 0
    total_users  = db.query(func.count(User.id)).scalar() or 0

    lang_rows = (
        db.query(Issue.language, func.count(Issue.id).label("cnt"))
        .filter(Issue.state == "open", Issue.language != "")
        .group_by(Issue.language)
        .order_by(func.count(Issue.id).desc())
        .limit(8)
        .all()
    )
    languages = [{"language": r.language, "count": r.cnt} for r in lang_rows]

    diff_rows = (
        db.query(Issue.difficulty, func.count(Issue.id).label("cnt"))
        .filter(Issue.state == "open")
        .group_by(Issue.difficulty)
        .all()
    )
    difficulties = {r.difficulty: r.cnt for r in diff_rows}

    return {
        "total_issues":   total_issues,
        "total_repos":    total_repos,
        "total_users":    total_users,
        "languages":      languages,
        "difficulties":   difficulties,
    }
