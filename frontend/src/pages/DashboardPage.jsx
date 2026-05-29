import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { LayoutDashboard, TrendingUp, Star, GitFork, Bookmark, Sparkles, ExternalLink, Trash2 } from 'lucide-react'
import { useBookmarks } from '../hooks/useBookmarks'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const { bookmarks } = useBookmarks()
  const { get, loading } = useApi()
  const [stats, setStats] = useState(null)
  const [savedProjects, setSavedProjects] = useState([])

  useEffect(() => {
    if (user) {
      get('/api/stats/user').then(setStats).catch(() => {})
    }
    
    // Load saved AI projects from localStorage
    const projects = JSON.parse(localStorage.getItem('oss_saved_projects') || '[]')
    setSavedProjects(projects)
  }, [user, bookmarks])

  const deleteProject = (projectId) => {
    const updatedProjects = savedProjects.filter(p => p.id !== projectId)
    setSavedProjects(updatedProjects)
    localStorage.setItem('oss_saved_projects', JSON.stringify(updatedProjects))
  }

  const updateProjectStatus = (projectId, newStatus) => {
    const updatedProjects = savedProjects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    )
    setSavedProjects(updatedProjects)
    localStorage.setItem('oss_saved_projects', JSON.stringify(updatedProjects))
  }

  if (!user) {
    return (
      <div style={{
        maxWidth: 500, margin: '80px auto', padding: '0 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: 'var(--text-4)',
        }}>
          <LayoutDashboard size={24} strokeWidth={1.5} />
        </div>
        <h2 style={{ fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>Sign in to view your dashboard</h2>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
          Track your contributions, bookmarks, and activity.
        </p>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Sign In</Link>
      </div>
    )
  }

  const CARDS = [
    { icon: Bookmark,   label: 'Bookmarked', value: bookmarks.length, color: 'var(--brand)' },
    { icon: Sparkles,   label: 'AI Projects', value: savedProjects.length, color: '#8b5cf6' },
    { icon: TrendingUp, label: 'Issues Viewed', value: stats?.issues_viewed ?? '—', color: '#198038' },
    { icon: Star,       label: 'Stars Given',   value: stats?.stars ?? '—', color: '#d97706' },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, color: 'var(--text)', marginBottom: 6 }}>
          Welcome back, <span style={{ color: 'var(--brand)', fontStyle: 'italic' }}>{user.username}</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Here's your contribution activity overview.</p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 36,
      }}>
        {CARDS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Icon size={17} color={color} strokeWidth={2} />
            </div>
            <p style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Saved AI Projects */}
      {savedProjects.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, color: 'var(--text)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: 8, color: '#8b5cf6' }} />
              Your AI Projects
            </h2>
            <Link to="/build-projects" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none' }}>
              Generate more →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {savedProjects.slice(0, 4).map((project) => (
              <div key={project.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                      {project.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="badge badge-blue" style={{ fontSize: 11 }}>
                        {project.level}
                      </span>
                      <select 
                        value={project.status}
                        onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                        style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          background: 'white'
                        }}
                      >
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteProject(project.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-4)',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>
                  {project.description}
                </p>
                
                {project.features && project.features.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-4)', marginBottom: 6 }}>
                      Features:
                    </p>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {project.features.slice(0, 4).map(feature => (
                        <span key={feature} className="badge badge-gray" style={{ fontSize: 10 }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                    Saved {new Date(project.savedAt).toLocaleDateString()}
                  </span>
                  {project.repos && project.repos.length > 0 && (
                    <a
                      href={project.repos[0].url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        color: 'var(--brand)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      View Example <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks preview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, color: 'var(--text)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Recent Bookmarks
          </h2>
          <Link to="/bookmarks" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        {bookmarks.length === 0 ? (
          <div className="card-flat" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-4)', fontSize: 14 }}>
            No bookmarks yet — <Link to="/" style={{ color: 'var(--brand)', textDecoration: 'none' }}>browse issues</Link> to save some.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookmarks.slice(0, 3).map((b, i) => {
              return (
                <div key={b.id || i} className="card" style={{
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}>
                  <p style={{ fontSize: 14, color: 'var(--text)', flex: 1, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.issue_title || b.title || 'Untitled Issue'}
                  </p>
                  <span className="badge badge-gray" style={{ flexShrink: 0 }}>
                    {b.repo_name || b.repository?.full_name || b.repo_full_name || 'Unknown Repo'}
                  </span>
                  <a href={b.issue_url || b.url || b.html_url || '#'} target="_blank" rel="noreferrer"
                    className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12, flexShrink: 0, textDecoration: 'none' }}>
                    View
                  </a>
                </div>
              )
            })}}
          </div>
        )}
      </div>
    </div>
  )
}
