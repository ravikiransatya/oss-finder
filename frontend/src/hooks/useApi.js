import { useState, useCallback } from 'react'
import API_BASE_URL from '../config/api';

const API = API_BASE_URL

// Demo data for when backend is not available
const DEMO_ISSUES = [
  {
    id: 1,
    title: "Add dark mode support to the dashboard",
    body: "We need to implement a dark mode toggle that persists user preference and applies to all components.",
    difficulty: "beginner",
    language: "JavaScript",
    labels: ["good first issue", "enhancement"],
    repo_full_name: "awesome-org/dashboard-app",
    repo_avatar: "https://github.com/github.png",
    url: "https://github.com/awesome-org/dashboard-app/issues/123",
    stars: 1250,
    forks: 89,
    comments: 5
  },
  {
    id: 2,
    title: "Fix responsive layout on mobile devices",
    body: "The navigation menu doesn't work properly on mobile screens smaller than 768px.",
    difficulty: "intermediate",
    language: "CSS",
    labels: ["bug", "mobile"],
    repo_full_name: "ui-library/responsive-components",
    repo_avatar: "https://github.com/github.png",
    url: "https://github.com/ui-library/responsive-components/issues/456",
    stars: 890,
    forks: 156,
    comments: 12
  },
  {
    id: 3,
    title: "Improve documentation for API endpoints",
    body: "Add examples and better descriptions for all REST API endpoints in the documentation.",
    difficulty: "beginner",
    language: "Markdown",
    labels: ["documentation", "help wanted"],
    repo_full_name: "api-docs/rest-documentation",
    repo_avatar: "https://github.com/github.png",
    url: "https://github.com/api-docs/rest-documentation/issues/789",
    stars: 445,
    forks: 67,
    comments: 3
  }
]

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (path, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const token = JSON.parse(localStorage.getItem('oss_user') || '{}')?.token
      const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Request failed: ${res.status}`)
      }
      return await res.json()
    } catch (e) {
      // If backend is not available, return demo data for issues endpoint
      if (path.includes('/api/issues') && e.message.includes('fetch')) {
        console.warn('Backend not available, using demo data')
        return { results: DEMO_ISSUES, total: DEMO_ISSUES.length }
      }
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback((path, params) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`${path}${q}`)
  }, [request])
  
  const post = useCallback((path, body) => 
    request(path, { method: 'POST', body: JSON.stringify(body) })
  , [request])

  return { loading, error, get, post }
}
