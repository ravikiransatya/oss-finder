import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const STORAGE_KEY = 'oss_bookmarks'

export function useBookmarks() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  }, [bookmarks])

  const fetchBookmarks = async () => {
    if (!user?.token) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBookmarks(data)
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch bookmarks when user changes
  useEffect(() => {
    if (user?.token) {
      fetchBookmarks()
    }
  }, [user?.token])

  const isBookmarked = (issueId) => {
    return bookmarks.some(b => {
      const bookmarkIssueId = b.issue_id || b.id
      return bookmarkIssueId === issueId
    })
  }

  const toggle = async (issue) => {
    const existing = bookmarks.find(b => {
      const bookmarkIssueId = b.issue_id || b.id
      return bookmarkIssueId === issue.id
    })
    
    if (existing) {
      // Remove bookmark
      if (user?.token) {
        try {
          const res = await fetch(`${API_BASE}/api/bookmarks/${existing.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${user.token}` }
          })
          if (res.ok) {
            setBookmarks(prev => prev.filter(b => b.id !== existing.id))
          }
        } catch (err) {
          console.error('Failed to remove bookmark:', err)
        }
      } else {
        // Demo mode - remove from local state
        setBookmarks(prev => prev.filter(b => {
          const bookmarkIssueId = b.issue_id || b.id
          return bookmarkIssueId !== issue.id
        }))
      }
    } else {
      // Add bookmark
      if (user?.token) {
        try {
          const res = await fetch(`${API_BASE}/api/bookmarks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({
              issue_id: issue.id,
              issue_url: issue.html_url || issue.url,
              issue_title: issue.title,
              repo_name: issue.repository?.full_name || issue.repo_full_name || 'Unknown'
            })
          })
          if (res.ok) {
            const newBookmark = await res.json()
            setBookmarks(prev => [newBookmark, ...prev])
          }
        } catch (err) {
          console.error('Failed to add bookmark:', err)
        }
      } else {
        // Demo mode - add to local state
        const newBookmark = {
          id: Date.now(), // temporary ID for demo mode
          issue_id: issue.id,
          issue_title: issue.title,
          issue_url: issue.html_url || issue.url,
          repo_name: issue.repository?.full_name || issue.repo_full_name,
          status: 'saved',
          saved_at: new Date().toISOString()
        }
        setBookmarks(prev => [newBookmark, ...prev])
      }
    }
  }

  const remove = async (bookmarkId) => {
    if (user?.token) {
      try {
        const res = await fetch(`${API_BASE}/api/bookmarks/${bookmarkId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` }
        })
        if (res.ok) {
          setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
        }
      } catch (err) {
        console.error('Failed to remove bookmark:', err)
      }
    } else {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    }
  }

  const removeMany = async (bookmarkIds) => {
    if (bookmarkIds.length === 0) return
    
    if (user?.token) {
      try {
        const res = await fetch(`${API_BASE}/api/bookmarks/bulk`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ ids: bookmarkIds })
        })
        if (res.ok) {
          const idSet = new Set(bookmarkIds)
          setBookmarks(prev => prev.filter(b => !idSet.has(b.id)))
        }
      } catch (err) {
        console.error('Failed to remove bookmarks:', err)
      }
    } else {
      const idSet = new Set(bookmarkIds)
      setBookmarks(prev => prev.filter(b => !idSet.has(b.id)))
    }
  }

  return { 
    bookmarks, 
    loading, 
    isBookmarked, 
    toggle, 
    remove, 
    removeMany, 
    refresh: fetchBookmarks 
  }
}
