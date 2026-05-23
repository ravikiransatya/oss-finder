from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Float, func
from database import Base

class Issue(Base):
    __tablename__ = "issues"

    id            = Column(Integer, primary_key=True, index=True)

    github_id     = Column(BigInteger, unique=True, nullable=False, index=True)

    title         = Column(String(500), nullable=False)
    body          = Column(Text, default="")
    url           = Column(String(500), nullable=False)

    repo_name     = Column(String(200), nullable=False, index=True)
    labels        = Column(String(500), default="")
    state         = Column(String(50), default="open")
    language      = Column(String(100), default="")

    stars         = Column(BigInteger, default=0)
    forks         = Column(BigInteger, default=0)
    comment_count = Column(BigInteger, default=0)

    difficulty    = Column(String(50), default="beginner")
    quality_score = Column(Float, default=0.0)

    embedding     = Column(Text, default="")

    created_at    = Column(DateTime, nullable=True)
    saved_at      = Column(DateTime, server_default=func.now())