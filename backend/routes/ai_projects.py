from fastapi import APIRouter
from dotenv import load_dotenv
from groq import Groq

import os
import requests
import json

load_dotenv()

router = APIRouter()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


@router.get("/ai-suggestions")
def ai_suggestions(
    skill: str,
    difficulty: str = "beginner"
):

    prompt = f"""
    Generate 6 real-world open source project ideas.

    Skill: {skill}
    Difficulty: {difficulty}

    Return ONLY JSON array.

    Example:
    [
      {{
        "title": "AI Resume Analyzer",
        "description": "Analyze resumes using AI",
        "level": "Intermediate",
        "realWorld": "High"
      }}
    ]
    """

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.8,
    )

    text = completion.choices[0].message.content

    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    start = text.find("[")
    end = text.rfind("]") + 1

    json_text = text[start:end]

    try:
        projects = json.loads(json_text)

    except Exception as e:
        print("JSON ERROR:", e)

        return {
            "projects": []
        }

    # FETCH GITHUB REPOS
    for project in projects:

        query = project["title"]

        headers = {}

        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"

        github_url = (
            "https://api.github.com/search/repositories"
            f"?q={query}&sort=stars&order=desc&per_page=5"
        )

        github_response = requests.get(
            github_url,
            headers=headers
        )

        repos = []

        if github_response.status_code == 200:

            items = github_response.json().get("items", [])

            repos = [
                {
                    "name": repo["full_name"],
                    "url": repo["html_url"],
                    "stars": repo["stargazers_count"],
                }
                for repo in items
            ]

        project["repos"] = repos

    return {
        "projects": projects
    }