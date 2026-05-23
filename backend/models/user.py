from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, func
from database import Base

class User(Base):
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    github_id    = Column(Integer, unique=True, nullable=False, index=True)
    username     = Column(String(200), nullable=False)
    name         = Column(String(200), default="")
    avatar       = Column(String(500), default="")
    bio          = Column(Text, default="")
    email        = Column(String(300), default="")
    github_url   = Column(String(500), default="")
    skills       = Column(JSON, default=list)   # ["JavaScript", "Python"]
    experience   = Column(String(50), default="beginner")  # beginner/intermediate/advanced
    streak_days  = Column(Integer, default=0)
    contributions = Column(Integer, default=0)
    created_at   = Column(DateTime, server_default=func.now())
    last_login   = Column(DateTime, server_default=func.now(), onupdate=func.now())
