from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from database import Base

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    issue_id   = Column(Integer, nullable=False)
    issue_url  = Column(String(500), default="")
    issue_title = Column(String(500), default="")
    repo_name  = Column(String(200), default="")
    status     = Column(String(50), default="saved")  # saved/applied/solved
    collection = Column(String(200), default="default")
    saved_at   = Column(DateTime, server_default=func.now())
