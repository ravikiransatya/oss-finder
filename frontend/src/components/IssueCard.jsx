import { Star, GitFork, ExternalLink, Bookmark, BookmarkCheck, MessageSquare } from 'lucide-react'
import { useBookmarks } from '../hooks/useBookmarks'

const DIFF_CLASS = {
  beginner:     'badge tag-beginner',
  intermediate: 'badge tag-intermediate',
  advanced:     'badge tag-advanced',
}

export default function IssueCard({ issue }) {
  const { isBookmarked, toggle } = useBookmarks()
  const bookmarked = isBookmarked(issue.id)

  const diff = (issue.difficulty || 'beginner').toLowerCase()

  return (
    <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className={DIFF_CLASS[diff] || 'badge badge-gray'}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </span>
            {issue.labels?.slice(0, 2).map(label => (
              <span key={label} className="badge badge-blue">{label}</span>
            ))}
          </div>
          <h3 style={{
            fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-body)',
            color: 'var(--text)', lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {issue.title}
          </h3>
        </div>

        <button
          onClick={() => toggle(issue)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: 8,
            color: bookmarked ? 'var(--brand)' : 'var(--text-4)',
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
          title={bookmarked ? 'Remove bookmark' : 'Save issue'}
        >
          {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
        </button>
      </div>

      {/* Description */}
      {issue.body && (
        <p style={{
          fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {issue.body}
        </p>
      )}

      {/* Repo info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px',
        background: 'var(--surface)',
        borderRadius: 8,
      }}>
        {issue.repo_avatar && (
          <img
            src={issue.repo_avatar}
            alt=""
            style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }}
          />
        )}
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', flex: 1, minWidth: 0 }}>
          {issue.repo_full_name || issue.repo}
        </span>
        {issue.language && (
          <span className="badge badge-gray" style={{ fontSize: 11 }}>{issue.language}</span>
        )}
      </div>

      {/* Footer row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {issue.stars != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-4)' }}>
              <Star size={12} strokeWidth={2} />
              {issue.stars?.toLocaleString()}
            </span>
          )}
          {issue.forks != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-4)' }}>
              <GitFork size={12} strokeWidth={2} />
              {issue.forks?.toLocaleString()}
            </span>
          )}
          {issue.comments != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-4)' }}>
              <MessageSquare size={12} strokeWidth={2} />
              {issue.comments}
            </span>
          )}
        </div>

        <a
          href={issue.url || issue.html_url}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
          style={{ padding: '7px 14px', fontSize: 13, textDecoration: 'none' }}
        >
          View Issue
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}
