import os
import httpx

from google import genai

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException

load_dotenv()

# NEW GEMINI CLIENT
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"]
)

GH_TOKEN = os.getenv("GITHUB_TOKEN", "")

def classify_difficulty(repo: dict) -> str:
    stars = repo.get("stargazers_count", 0)

    name = (
        repo.get("name", "") + " " +
        (repo.get("description") or "") + " " +
        " ".join(repo.get("topics", []))
    ).lower()

    adv_kw = [
        "distributed",
        "microservice",
        "compiler",
        "kernel",
        "blockchain",
        "machine-learning",
        "neural",
        "system"
    ]

    beg_kw = [
        "beginner",
        "starter",
        "simple",
        "basic",
        "tutorial",
        "todo",
        "calculator",
        "weather",
        "hello",
        "demo"
    ]

    if any(k in name for k in adv_kw) or stars > 5000:
        return "advanced"

    if any(k in name for k in beg_kw) or stars < 500:
        return "beginner"

    return "intermediate"


@router.get("/search")
async def search_projects(
    q: str,
    language: str = "",
    page: int = 1
):
    lang_filter = f"+language:{language}" if language else ""

    url = (
        f"https://api.github.com/search/repositories"
        f"?q={q}{lang_filter}"
        f"&sort=stars&order=desc"
        f"&per_page=60&page={page}"
    )

    headers = {
        "Accept": "application/vnd.github.v3+json"
    }

    if GH_TOKEN:
        headers["Authorization"] = f"Bearer {GH_TOKEN}"

    async with httpx.AsyncClient() as client:
        res = await client.get(
            url,
            headers=headers,
            timeout=10
        )

    if res.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="GitHub API error"
        )

    data = res.json()

    items = data.get("items", [])

    repos = []

    for r in items:
        repos.append({
            "github_id": r["id"],
            "full_name": r["full_name"],
            "description": r.get("description") or "",
            "html_url": r["html_url"],
            "language": r.get("language") or "",
            "stargazers_count": r["stargazers_count"],
            "forks_count": r["forks_count"],
            "open_issues_count": r["open_issues_count"],
            "topics": r.get("topics", []),
            "updated_at": r["updated_at"],
            "difficulty": classify_difficulty(r),
        })

    return {
        "total": data.get("total_count", 0),
        "repos": repos
    }


@router.get("/ai-summary")
async def ai_summary(query: str, repos: str):

    prompt = f"""
    User searched for: {query}

    Top repositories:
    {repos}

    Give:
    1. Short learning roadmap
    2. Suggested features
    3. Tech stack
    4. Difficulty level
    5. 3 tags
    """

    try:
        response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt
)

        return {
            "text": response.text
        }

    except Exception as e:
      print("GEMINI ERROR:", e)

    q = query.lower()

    # SMART FEATURE GENERATION
    features = []

    if "todo" in q or "task" in q:
        features = [
            "Task creation & editing",
            "Priority management",
            "Drag and drop task board",
            "Dark mode support",
            "Deadline reminders"
        ]
        difficulty = "Beginner"

    elif "chat" in q or "message" in q:
        features = [
            "Real-time messaging",
            "Online/offline status",
            "Typing indicators",
            "Media sharing",
            "Group chat support"
        ]
        difficulty = "Intermediate"

    elif "fraud" in q or "bank" in q:
        features = [
            "Fraud prediction model",
            "Transaction analytics",
            "Risk scoring dashboard",
            "Suspicious activity alerts",
            "ML model training"
        ]
        difficulty = "Advanced"

    elif "ecommerce" in q or "shop" in q:
        features = [
            "Product catalog",
            "Cart & checkout",
            "Payment integration",
            "Order tracking",
            "Admin dashboard"
        ]
        difficulty = "Intermediate"

    else:
        features = [
            "Authentication system",
            "Dashboard UI",
            "Search & filtering",
            "API integration",
            "Responsive design"
        ]
        difficulty = "Intermediate"

    # DYNAMIC STACK
    if "python" in repos.lower():
        backend = "FastAPI / Django"
    elif "java" in repos.lower():
        backend = "Spring Boot"
    else:
        backend = "Node.js / Express"

    if "react" in repos.lower():
        frontend = "React"
    elif "vue" in repos.lower():
        frontend = "Vue"
    else:
        frontend = "HTML/CSS/JavaScript"

    return {
        "text": f"""
🚀 AI Project Suggestions for: {query}

📚 Recommended Learning Path:
1. Build UI first
2. Create backend APIs
3. Connect database
4. Add authentication
5. Deploy project

🛠 Suggested Tech Stack:
Frontend: {frontend}
Backend: {backend}
Database: PostgreSQL / MongoDB

✨ Suggested Features:
- {features[0]}
- {features[1]}
- {features[2]}
- {features[3]}
- {features[4]}

🎯 Difficulty:
{difficulty}

🏷 Tags:
#opensource #portfolio #fullstack
"""
    }