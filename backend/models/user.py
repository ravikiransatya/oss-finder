from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    JSON,
    func,
)

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # GITHUB AUTH
    github_id = Column(
        Integer,
        unique=True,
        nullable=True,
        index=True
    )

    # NORMAL AUTH
    password = Column(
        String(500),
        nullable=True
    )

    # USER INFO
    username = Column(
        String(200),
        nullable=False
    )

    name = Column(
        String(200),
        default=""
    )

    avatar = Column(
        String(500),
        default=""
    )

    bio = Column(
        Text,
        default=""
    )

    email = Column(
        String(300),
        unique=True,
        nullable=False
    )

    github_url      = Column(String(500), default="")
    location        = Column(String(200), default="")
    website         = Column(String(500), default="")

    # EMAIL VERIFICATION
    is_verified     = Column(Integer, default=0)
    verify_token    = Column(String(200), nullable=True)

    # PASSWORD RESET
    reset_token        = Column(String(200), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    # PROFILE
    skills = Column(
        JSON,
        default=list
    )

    experience = Column(
        String(50),
        default="beginner"
    )

    # STATS
    streak_days = Column(
        Integer,
        default=0
    )

    contributions = Column(
        Integer,
        default=0
    )

    # TIMESTAMPS
    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    last_login = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )