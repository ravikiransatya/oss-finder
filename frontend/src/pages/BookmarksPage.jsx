import { useEffect, useState } from 'react'
import { Bookmark, ExternalLink, Trash2, LogIn, CheckCircle, Target, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchBookmarks, updateBookmark, deleteBookmark } from '../api/issues'

const STATUS_STYLES = {
  saved:   'bg-brand-600/15 text-brand-300 border-brand-500/20',
  applied: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  solved:  'bg-accent-500/15 text-accent-400 border-accent-500/20',
}

const STATUS_ICONS = {
  saved:   Clock,
  applied: Target,
  solved:  CheckCircle,
}

function BookmarkCard({ bm, onUpdate, onDelete }) {
  const [updating, setUpdating] = useState(false)
  const Icon = STATUS_ICONS[bm.status] || Clock

  const cycleStatus = async () => {
    setUpdating(true)
    const next = { saved: 'applied', applied: 'solved', solved: 'saved' }[bm.status] || 'saved'
    await onUpdate(bm.id, { status: next })
    setUpdating(false)
  }

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="badge bg-brand-600/15 text-brand-300 border border-brand-500/20 text-xs truncate max-w-[140px]">
            {bm.repo_name?.split('/')[1] ?? bm.repo_name}
          </span>
        </div>
        <p className="text-sm text-white/80 leading-snug line-clamp-2 mb-2">{bm.issue_title}</p>
        <p className="text-xs text-white/30">Saved {bm.saved_at ? new Date(bm.saved_at).toLocaleDateString() : ''}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={cycleStatus}
          disabled={updating}
          className={`badge border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[bm.status] || STATUS_STYLES.saved}`}
          title="Click to cycle status"
        >
          <Icon size={10} className="mr-1" />
          {bm.status}
        </button>
        <div className="flex gap-1.5">
          <a href={bm.issue_url} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-white/30 hover:text-brand-400 hover:bg-white/5 transition-colors">
            <ExternalLink size={13} />
          </a>
          <button onClick={() => onDelete(bm.id)}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookmarksPage() {
  const { user, token, login } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading]    = useState(true)
  const [filter, setFilter]      = useState('all')

  const load = async () => {
    if (!token) return
    setLoading(true)
    const data = await fetchBookmarks(token).catch(() => [])
    setBookmarks(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [token])

  const handleUpdate = async (id, data) => {
    const updated = await updateBookmark(token, id, data)
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b))
  }

  const handleDelete = async (id) => {
    await deleteBookmark(token, id).catch(() => {})
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-20 flex flex-col items-center justify-center text-center page-enter">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-5">
          <Bookmark size={28} className="text-brand-400" />
        </div>
        <h2 className="font-display text-2xl font-700 text-white mb-2">Bookmarks</h2>
        <p className="text-white/40 text-sm mb-6">Sign in to save and track issues.</p>
        <button onClick={login} className="btn-primary"><LogIn size={15} /> Sign in with GitHub</button>
      </div>
    )
  }

  const counts = { all: bookmarks.length, saved: 0, applied: 0, solved: 0 }
  bookmarks.forEach(b => { if (counts[b.status] !== undefined) counts[b.status]++ })

  const displayed = filter === 'all' ? bookmarks : bookmarks.filter(b => b.status === filter)

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-700 text-white">Bookmarks</h1>
          <p className="text-sm text-white/40">{bookmarks.length} saved issues</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'saved', 'applied', 'solved'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === status
                ? 'bg-brand-600/25 text-brand-300 border border-brand-500/30'
                : 'bg-white/5 text-white/40 border border-white/8 hover:text-white/60'
            }`}
          >
            {status} <span className="ml-1 opacity-60">({counts[status]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-4 h-20 shimmer" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">
            {filter === 'all' ? 'No bookmarks yet — explore issues and save ones you want to work on.' : `No ${filter} issues.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map(bm => (
            <BookmarkCard key={bm.id} bm={bm} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
