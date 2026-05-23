import { ExternalLink, Star, MessageCircle, Bookmark, BookmarkCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { addBookmark } from '../api/issues'
import { useState } from 'react'

const LABEL_STYLES = {
  'good first issue': 'bg-accent-500/15 text-accent-400 border-accent-500/25',
  'bug':              'bg-red-500/15 text-red-400 border-red-500/25',
  'documentation':    'bg-blue-500/15 text-blue-300 border-blue-500/25',
  'help wanted':      'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  'enhancement':      'bg-purple-500/15 text-purple-300 border-purple-500/25',
  'feature':          'bg-pink-500/15 text-pink-300 border-pink-500/25',
}
const getLabelStyle = (label) =>
  LABEL_STYLES[label.toLowerCase()] ?? 'bg-white/8 text-white/50 border-white/10'

const DIFF_STYLES = {
  beginner:     'tag-beginner',
  intermediate: 'tag-intermediate',
  advanced:     'tag-advanced',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function IssueCard({ issue, onBookmark }) {
  const { user, token } = useAuth()
  const [bookmarked, setBookmarked] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleBookmark = async (e) => {
    e.preventDefault()
    if (!user || !token) return
    setSaving(true)
    try {
      await addBookmark(token, issue)
      setBookmarked(true)
      onBookmark?.()
    } catch (_) {}
    setSaving(false)
  }

  return (
    <article className="card p-5 flex flex-col gap-3 group animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="badge bg-brand-600/20 text-brand-300 border border-brand-500/20 truncate max-w-[160px]">
            {issue.repo?.split('/')[1] ?? issue.repo}
          </span>
          {issue.difficulty && (
            <span className={DIFF_STYLES[issue.difficulty] ?? 'badge bg-white/10 text-white/50'}>
              {issue.difficulty}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-white/30">{timeAgo(issue.created_at)}</span>
          {user && (
            <button
              onClick={handleBookmark}
              disabled={saving || bookmarked}
              className="text-white/30 hover:text-brand-400 transition-colors disabled:opacity-50"
              title="Bookmark"
            >
              {bookmarked ? <BookmarkCheck size={15} className="text-brand-400" /> : <Bookmark size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display font-600 text-white/90 text-sm leading-snug line-clamp-2 flex-1">
        {issue.title}
      </h3>

      {/* Labels */}
      {issue.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {issue.labels.slice(0, 3).map(label => (
            <span key={label} className={`badge border ${getLabelStyle(label)}`}>
              {label}
            </span>
          ))}
          {issue.labels.length > 3 && (
            <span className="badge bg-white/5 text-white/30 border border-white/8">
              +{issue.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-3 text-white/30 text-xs">
          {issue.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-400/60" />
              {issue.language}
            </span>
          )}
          {issue.stars > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} />
              {issue.stars >= 1000 ? `${(issue.stars/1000).toFixed(1)}k` : issue.stars}
            </span>
          )}
          {issue.comment_count > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle size={11} />
              {issue.comment_count}
            </span>
          )}
        </div>
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          View <ExternalLink size={11} />
        </a>
      </div>
    </article>
  )
}
