import API_BASE_URL from '../config/api';

const BASE = `${API_BASE_URL}/api`

const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {}

export async function fetchIssues({ skip = 0, limit = 20, search = '', language = '', difficulty = '', sort = 'newest' } = {}) {
  const params = new URLSearchParams({ skip, limit })
  if (search)     params.set('search', search)
  if (language)   params.set('language', language)
  if (difficulty) params.set('difficulty', difficulty)
  if (sort)       params.set('sort', sort)
  const r = await fetch(`${BASE}/issues?${params}`)
  if (!r.ok) throw new Error('Failed to fetch issues')
  return r.json()
}

export async function fetchStats() {
  const r = await fetch(`${BASE}/stats`)
  if (!r.ok) throw new Error('Failed to fetch stats')
  return r.json()
}

export async function semanticSearch({ query, language, difficulty, limit = 10 }) {
  const r = await fetch(`${BASE}/semantic-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language, difficulty, limit }),
  })
  if (!r.ok) throw new Error('Search failed')
  return r.json()
}

export async function fetchRecommendations({ skills = [], experience = 'beginner', limit = 10 } = {}) {
  const params = new URLSearchParams({ skills: skills.join(','), experience, limit })
  const r = await fetch(`${BASE}/recommend?${params}`)
  if (!r.ok) throw new Error('Failed to fetch recommendations')
  return r.json()
}

export async function fetchProfile(token) {
  const r = await fetch(`${BASE}/user/profile`, { headers: authHeaders(token) })
  if (!r.ok) throw new Error('Not authenticated')
  return r.json()
}

export async function updateProfile(token, data) {
  const r = await fetch(`${BASE}/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  })
  if (!r.ok) throw new Error('Update failed')
  return r.json()
}

export async function fetchUserStats(token) {
  const r = await fetch(`${BASE}/user/stats`, { headers: authHeaders(token) })
  if (!r.ok) throw new Error('Failed')
  return r.json()
}

export async function fetchBookmarks(token) {
  const r = await fetch(`${BASE}/bookmarks`, { headers: authHeaders(token) })
  if (!r.ok) throw new Error('Failed')
  return r.json()
}

export async function addBookmark(token, issue) {
  const r = await fetch(`${BASE}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({
      issue_id:    issue.id,
      issue_url:   issue.url,
      issue_title: issue.title,
      repo_name:   issue.repo,
    }),
  })
  if (!r.ok) throw new Error('Failed')
  return r.json()
}

export async function updateBookmark(token, id, data) {
  const r = await fetch(`${BASE}/bookmarks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  })
  if (!r.ok) throw new Error('Failed')
  return r.json()
}

export async function deleteBookmark(token, id) {
  const r = await fetch(`${BASE}/bookmarks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!r.ok) throw new Error('Failed')
  return r.json()
}
