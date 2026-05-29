from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests
import json
import re
from typing import List, Dict, Any

router = APIRouter()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def ask_ai(prompt: str, system: str = "You are an expert software developer.", max_tokens: int = 2048) -> str:
    if not GROQ_API_KEY:
        return "AI not available — set GROQ_API_KEY in your .env file."
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        r = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        return r.choices[0].message.content or ""
    except Exception as e:
        print(f"Groq error: {e}")
        return f"AI error: {str(e)[:200]}"


class ProjectRequest(BaseModel):
    prompt: str


class BuildRequest(BaseModel):
    project: dict
    phase: str
    userMessage: str
    previousMessages: List[dict] = []


@router.post("/ai-build")
def ai_build_project(request: BuildRequest):
    project = request.project
    phase = request.phase
    user_message = request.userMessage.strip()
    previous_messages = request.previousMessages

    project_title = project.get("title", "Project")
    project_features = project.get("features", [])
    tech_stack = project.get("tech_stack", [])
    description = project.get("description", "")

    # Build conversation history
    history_msgs = []
    for msg in previous_messages[-8:]:
        role = msg.get("role", "user")
        content = str(msg.get("content", ""))[:500]
        if role in ("user", "assistant"):
            history_msgs.append({"role": role, "content": content})

    system = f"""You are an expert software developer helping build: "{project_title}".
Project: {description}
Features: {', '.join(project_features[:6]) if project_features else 'standard features'}
Tech stack: {', '.join(tech_stack) if tech_stack else 'React, Node.js/Express, PostgreSQL'}
Build phase: {phase}

Rules:
- Always respond directly to what the user asked — never give the same generic answer twice
- When asked for code (login form, component, API route, model, etc.), generate complete working code
- Format code with triple backticks and language name
- Label each file with its path as a comment at the top
- Be specific to this project, not generic
- If the user repeats a request, give them the actual implementation"""

    if not GROQ_API_KEY:
        return {"message": "Set GROQ_API_KEY in backend/.env to enable AI responses.", "code": None, "nextSteps": []}

    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        messages = [{"role": "system", "content": system}]
        messages.extend(history_msgs)
        messages.append({"role": "user", "content": user_message})

        r = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=2048,
            temperature=0.7
        )
        ai_text = r.choices[0].message.content or ""
    except Exception as e:
        print(f"Groq error: {e}")
        ai_text = f"Error calling AI: {str(e)[:200]}"

    # Extract code blocks and map to files
    code_blocks = re.findall(r'```(\w*)\n(.*?)```', ai_text, re.DOTALL)
    files = {}
    for i, (lang, code) in enumerate(code_blocks):
        code = code.strip()
        # Try to get filename from first line comment
        first_line = code.split('\n')[0].strip()
        fname = None
        if first_line.startswith(('//', '#', '/*')) and ('.' in first_line):
            candidate = re.sub(r'^[/#\s*]+', '', first_line).strip()
            if len(candidate) < 80 and re.search(r'\.\w{1,5}$', candidate):
                fname = candidate
        if not fname:
            ext_map = {'javascript': 'js', 'js': 'js', 'jsx': 'jsx', 'typescript': 'ts',
                       'ts': 'ts', 'tsx': 'tsx', 'python': 'py', 'py': 'py',
                       'css': 'css', 'html': 'html', 'json': 'json', 'bash': 'sh',
                       'sh': 'sh', 'sql': 'sql', 'yaml': 'yml', 'yml': 'yml'}
            ext = ext_map.get(lang.lower(), 'txt')
            fname = f"file_{i+1}.{ext}"
        files[fname] = code

    return {
        "message": ai_text,
        "code": files if files else None,
        "nextSteps": []
    }


@router.post("/ai-suggest")
def ai_suggest_projects(request: ProjectRequest):
    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    ai_prompt = f"""A developer said: "{prompt}"

Generate exactly 3 open-source project ideas they could build.

Return ONLY a valid JSON array with exactly 3 objects. Each object must have:
- "title": string
- "description": string (2 sentences)
- "level": "Beginner" or "Intermediate" or "Advanced"
- "features": array of 5 strings
- "tech_stack": array of 3-4 technology strings
- "category": string

No markdown, no explanation, just the JSON array."""

    fallback = [
        {
            "title": f"Project for: {prompt[:40]}",
            "description": "A full-stack web application with modern features. Built with React and Node.js.",
            "level": "Intermediate",
            "features": ["User Authentication", "Dashboard", "API Integration", "Responsive Design", "Database"],
            "tech_stack": ["React", "Node.js", "PostgreSQL"],
            "category": "web_app"
        }
    ]

    ai_text = ask_ai(ai_prompt, system="You are a software architect. Return only valid JSON, no markdown.", max_tokens=800)

    projects = fallback
    if ai_text and not ai_text.startswith("AI error"):
        try:
            clean = re.sub(r'```json|```', '', ai_text).strip()
            parsed = json.loads(clean)
            if isinstance(parsed, list) and len(parsed) > 0:
                projects = parsed
        except Exception:
            pass

    repos = fetch_github_repos(prompt)

    for i, p in enumerate(projects):
        p["id"] = abs(hash(p.get("title", str(i)))) % 100000
        p.setdefault("repos", [])
        p.setdefault("realWorld", "High")

    if repos and projects:
        projects[0]["repos"] = repos

    return {
        "projects": projects,
        "total": len(projects),
        "category": projects[0].get("category", "web_app") if projects else "web_app"
    }


def fetch_github_repos(query: str) -> List[Dict[str, Any]]:
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    stop = {"with", "that", "this", "want", "build", "create", "make", "using", "have", "from", "into"}
    words = [w for w in query.lower().split() if len(w) > 3 and w not in stop]
    search_q = "+".join(words[:4]) or "open-source"

    try:
        resp = requests.get(
            f"https://api.github.com/search/repositories?q={search_q}&sort=stars&order=desc&per_page=6",
            headers=headers, timeout=10
        )
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            return [
                {
                    "name": r["full_name"],
                    "url": r["html_url"],
                    "stars": r["stargazers_count"],
                    "description": (r.get("description") or "")[:150],
                    "language": r.get("language") or "Unknown",
                    "forks": r.get("forks_count", 0)
                }
                for r in items if r["stargazers_count"] >= 5
            ][:6]
    except Exception as e:
        print(f"GitHub fetch error: {e}")
    return []
