import { Bookmark, Trash2, Check, X } from 'lucide-react'
import IssueCard from '../components/IssueCard'
import EmptyState from '../components/EmptyState'
import { useBookmarks } from '../hooks/useBookmarks'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function BookmarksPage() {
  const { bookmarks, loading, remove, removeMany } = useBookmarks()
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-3)' }}>Loading bookmarks...</div>
      </div>
    )
  }

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    setSelectedIds(new Set(bookmarks.map(b => b.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setIsSelectionMode(false)
  }

  const deleteSelected = () => {
    removeMany([...selectedIds])
    clearSelection()
  }

  const enterSelectionMode = () => {
    setIsSelectionMode(true)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, color: 'var(--text)', marginBottom: 6 }}>Bookmarks</h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)' }}>
            {bookmarks.length} saved issue{bookmarks.length !== 1 ? 's' : ''}
            {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {bookmarks.length > 0 && !isSelectionMode && (
            <>
              <span className="badge badge-blue">{bookmarks.length} saved</span>
              <button 
                onClick={enterSelectionMode}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                Select
              </button>
            </>
          )}
          {isSelectionMode && (
            <>
              <button 
                onClick={selectAll}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                Select All
              </button>
              <button 
                onClick={clearSelection}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                <X size={16} /> Cancel
              </button>
              {selectedIds.size > 0 && (
                <button 
                  onClick={deleteSelected}
                  className="btn-danger"
                  style={{ padding: '8px 16px', fontSize: 14 }}
                >
                  <Trash2 size={16} /> Delete ({selectedIds.size})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Save issues while browsing to find them here later."
          action={<Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Issues</Link>}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {bookmarks.map((bookmark, i) => {
            // Convert bookmark to issue format for IssueCard
            const issue = {
              id: bookmark.issue_id || bookmark.id,
              title: bookmark.issue_title || bookmark.title,
              html_url: bookmark.issue_url || bookmark.html_url || bookmark.url,
              body: bookmark.body || '',
              repo_full_name: bookmark.repo_name || bookmark.repository?.full_name,
              difficulty: bookmark.difficulty || 'beginner',
              labels: bookmark.labels || [],
              language: bookmark.language,
              stars: bookmark.stars,
              forks: bookmark.forks,
              comments: bookmark.comments
            }
            
            return (
              <div key={bookmark.id || i} style={{ position: 'relative' }}>
                {isSelectionMode && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      zIndex: 10,
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: '2px solid var(--border)',
                      background: selectedIds.has(bookmark.id) ? 'var(--brand)' : 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => toggleSelection(bookmark.id)}
                  >
                    {selectedIds.has(bookmark.id) && <Check size={14} color="white" />}
                  </div>
                )}
                <div style={{
                  opacity: isSelectionMode && selectedIds.has(bookmark.id) ? 0.7 : 1,
                  transform: isSelectionMode && selectedIds.has(bookmark.id) ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.15s'
                }}>
                  <IssueCard issue={issue} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
