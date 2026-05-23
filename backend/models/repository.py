from sqlalchemy import Column, Integer, BigInteger, String, Text, Float, DateTime, func
from database import Base


class Repository(Base):
    __tablename__ = "repositories"

    # Primary key
    id                  = Column(Integer, primary_key=True, index=True)

    # GitHub identifiers
    github_id           = Column(BigInteger, unique=True, nullable=False, index=True)
    repo_name           = Column(String(200), unique=True, nullable=False, index=True)
    full_name           = Column(String(300), nullable=False, index=True)
    url                 = Column(String(500), nullable=False)

    # Core info
    description         = Column(Text, default="")
    language            = Column(String(100), default="")
    topics              = Column(Text, default="")        # comma-separated

    # Stats
    stars               = Column(BigInteger, default=0)
    forks               = Column(BigInteger, default=0)
    open_issues_count   = Column(BigInteger, default=0)

    # Quality metrics (your original scoring fields)
    quality_score       = Column(Float, default=0.0)
    beginner_friendly   = Column(Float, default=0.0)     # 0.0 – 1.0 score
    avg_response_days   = Column(Float, default=0.0)

    # Classification (new Build Projects fields)
    difficulty          = Column(String(50), default="beginner")   # beginner / intermediate / advanced
    search_query        = Column(String(200), default="")

    # Timestamps
    last_synced         = Column(DateTime, server_default=func.now())
    saved_at            = Column(DateTime, server_default=func.now())