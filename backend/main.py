from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine
from models.base import Base

from routes import issues, auth, users, search, bookmarks, stats
from routes.projects import router as projects_router

# NEW AI ROUTER
from routes.ai_projects import router as ai_projects_router

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CREATE DATABASE TABLES
Base.metadata.create_all(bind=engine)

# RATE LIMITER
limiter = Limiter(key_func=get_remote_address)

# FASTAPI APP
app = FastAPI(
    title="OSS Finder API",
    description="Smart Open Source Contribution Finder with AI",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# LIMITER
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://ossfinder.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES
app.include_router(issues.router,    prefix="/api")
app.include_router(auth.router,      prefix="/api")
app.include_router(users.router,     prefix="/api")
app.include_router(search.router,    prefix="/api")
app.include_router(bookmarks.router, prefix="/api")
app.include_router(stats.router,     prefix="/api")

# PROJECT ROUTES
app.include_router(projects_router)

# NEW AI PROJECT ROUTE
app.include_router(
    ai_projects_router,
    prefix="/api/projects",
    tags=["AI Projects"]
)

# ROOT
@app.get("/")
def root():
    return {
        "message": "OSS Finder API v2 running",
        "docs": "/docs"
    }

# HEALTH CHECK
@app.get("/health")
def health():
    return {
        "status": "ok"
    }