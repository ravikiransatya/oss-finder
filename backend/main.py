import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from apscheduler.schedulers.background import BackgroundScheduler

from database import engine
from models.base import Base

from routes import issues, auth, users, search, bookmarks, stats
from routes.projects import router as projects_router
from routes.ai_projects import router as ai_projects_router

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create DB tables
Base.metadata.create_all(bind=engine)

# ========================
# BACKGROUND FETCH JOB
# ========================

def run_fetch_issues():
    try:
        logger.info("[Scheduler] Fetching fresh issues from GitHub...")
        import sys, os
        sys.path.insert(0, os.path.dirname(__file__))
        from scripts.fetch_issues import main as fetch_main
        fetch_main()
        logger.info("[Scheduler] Done fetching issues.")
    except Exception as e:
        logger.error(f"[Scheduler] Failed: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(run_fetch_issues, "interval", hours=6, id="fetch_issues")
scheduler.start()
logger.info("[Scheduler] Started — issues will refresh every 6 hours.")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="OSS Finder API",
    description="Smart Open Source Contribution Finder with AI",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "http://localhost:5173",
    "https://oss-finder.vercel.app",
    "https://oss-finder-6ffv0oall-n-ravi-kiran-satyas-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(issues.router,       prefix="/api")
app.include_router(auth.router,         prefix="/api")
app.include_router(users.router,        prefix="/api")
app.include_router(search.router,       prefix="/api")
app.include_router(bookmarks.router,    prefix="/api")
app.include_router(stats.router,        prefix="/api")
app.include_router(projects_router)
app.include_router(ai_projects_router,  prefix="/api/projects", tags=["AI Projects"])


@app.get("/")
def root():
    return {"message": "OSS Finder API v2 running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/admin/fetch-issues")
def trigger_fetch():
    import threading
    threading.Thread(target=run_fetch_issues, daemon=True).start()
    return {"message": "Fetch started in background"}
