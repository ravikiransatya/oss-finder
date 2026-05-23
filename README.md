# OSS Finder 🔍

> **A smart platform that helps developers discover beginner-friendly and relevant open-source issues using AI.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql)](https://postgresql.org)

---

## ✨ Features

| Feature | Status |
|---------|--------|
| GitHub OAuth login | ✅ |
| AI Semantic Search | ✅ |
| Personalised Recommendations | ✅ |
| Advanced Filters (language, difficulty, sort) | ✅ |
| Infinite Scroll | ✅ |
| Bookmark + Track issues (saved/applied/solved) | ✅ |
| User Dashboard with streaks | ✅ |
| Skill-based profile | ✅ |
| Dark-themed responsive UI | ✅ |
| Rate limiting | ✅ |
| Docker deployment | ✅ |

---

## 🚀 Quick Start (Local)

### 1. Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16

### 2. Database
```bash
psql -U postgres
CREATE DATABASE ossfinder;
\q
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Fill in GITHUB_TOKEN, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET, DATABASE_URL

pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Populate issues
```bash
python scripts/fetch_issues.py
```

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## 🐳 Docker (Recommended)

```bash
cp backend/.env.example backend/.env
# Fill in your .env

docker compose up --build
# Open http://localhost
```

---

## 🔑 GitHub OAuth Setup

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Set:
   - **Homepage URL**: `http://localhost:5173`
   - **Callback URL**: `http://localhost:5173`  *(frontend handles the `?code=` param)*
3. Copy **Client ID** and **Client Secret** → paste into `backend/.env`

> **No GITHUB_CLIENT_ID set?** The app runs in **demo mode** — a test user is created automatically so you can still explore all features.

---

## 🧠 AI Semantic Search

To enable true semantic (meaning-based) search:
```bash
pip install sentence-transformers  # ~500MB one-time download
# Then in fetch_issues.py, uncomment the embedding section
python scripts/fetch_issues.py --embed
```

Without sentence-transformers, the `/api/semantic-search` endpoint falls back to keyword search automatically.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | List issues with filters |
| GET | `/api/issues/{id}` | Single issue |
| POST | `/api/semantic-search` | AI semantic search |
| GET | `/api/recommend` | Skill-based recommendations |
| GET | `/api/stats` | Platform statistics |
| GET | `/api/auth/github` | Get GitHub OAuth URL |
| GET | `/api/auth/github/callback?code=` | Exchange code for JWT |
| GET | `/api/user/profile` | Get profile (auth) |
| PUT | `/api/user/profile` | Update profile (auth) |
| GET | `/api/bookmarks` | List bookmarks (auth) |
| POST | `/api/bookmarks` | Save bookmark (auth) |
| PUT | `/api/bookmarks/{id}` | Update status (auth) |
| DELETE | `/api/bookmarks/{id}` | Remove bookmark (auth) |

Interactive docs: **http://localhost:8000/docs**

---

## 🏗️ Architecture

```
Browser (React/Vite)
    ↕  REST + JWT
FastAPI (Python)
    ↕
PostgreSQL
```

---

## 🚢 Production Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel (free) |
| Backend | Render / Railway |
| Database | Supabase / Neon |

### Vercel Frontend
```bash
cd frontend
npm run build
# Deploy /dist to Vercel
# Set VITE_API_URL env var to your backend URL
```

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Lucide Icons  
**Backend:** FastAPI, SQLAlchemy, PyJWT, slowapi, httpx  
**Database:** PostgreSQL 16  
**AI:** sentence-transformers (optional), cosine similarity  
**DevOps:** Docker, Nginx, docker-compose
