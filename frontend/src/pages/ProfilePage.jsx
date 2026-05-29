import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LogOut, Settings, Github, CheckCircle, Star, ExternalLink, X, 
  Calendar, MapPin, Link as LinkIcon, Trophy, Target, 
  BookOpen, Code, Users, Activity, Edit3, Camera,
  Award, Zap, TrendingUp, GitBranch
} from 'lucide-react'

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth()
  const nav = useNavigate()

  const [editing, setEditing]   = useState(false)
  const [name, setName]         = useState('')
  const [bio, setBio]           = useState('')
  const [email, setEditEmail]   = useState('')
  const [experience, setExperience] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite]   = useState('')
  const [skills, setSkills]     = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [saving, setSaving]     = useState(false)
  const [editError, setEditError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const [repos, setRepos]       = useState([])
  const [reposLoading, setReposLoading] = useState(false)
  const [stats, setStats]       = useState({
    totalBookmarks: 0,
    appliedIssues: 0,
    solvedIssues: 0,
    streak: 0,
    contributions: 0
  })

  // fetch fresh profile so email always shows
  useEffect(() => {
    if (!user?.token) return
    
    // Fetch profile data
    fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(data => {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem('oss_user', JSON.stringify(updatedUser))
      })
      .catch(() => {})
    
    // Fetch user statistics
    fetch('/api/user/stats', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  const handleLogout = () => { logout(); nav('/') }

  function openEdit() {
    setName(user.name || '')
    setBio(user.bio || '')
    setEditEmail(user.email || '')
    setExperience(user.experience || 'beginner')
    setLocation(user.location || '')
    setWebsite(user.website || '')
    setSkills(user.skills || [])
    setEditError('')
    setEditing(true)
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setEditError('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name, bio, experience, email, location, website, skills }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated = await res.json()
      const updatedUser = { ...user, ...updated }
      setUser(updatedUser)
      localStorage.setItem('oss_user', JSON.stringify(updatedUser))
      setEditing(false)
    } catch {
      setEditError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!user?.github_url) {
      console.log('No github_url found for user:', user)
      return
    }
    console.log('Fetching repos for github_url:', user.github_url)
    setReposLoading(true)
    fetch('/api/user/github-repos', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => {
        console.log('GitHub repos response status:', r.status)
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(data => {
        console.log('GitHub repos data:', data)
        setRepos(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Failed to fetch GitHub repos:', err)
        setRepos([])
      })
      .finally(() => setReposLoading(false))
  }, [user?.github_url, user?.token])

  if (!user) return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <h2 style={{ fontSize: 22, color: 'var(--text)', marginBottom: 16 }}>Not signed in</h2>
      <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Sign In</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '48px auto', padding: '0 24px' }}>

      {/* Enhanced Profile Header */}
      <div className="card" style={{ padding: '40px', marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(50%, -50%)' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: user.avatar ? 'transparent' : 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 600, color: 'white',
            overflow: 'hidden', flexShrink: 0, border: '3px solid rgba(255,255,255,0.3)',
            position: 'relative'
          }}>
            {user.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user.username?.[0]?.toUpperCase()}
            <button style={{
              position: 'absolute', bottom: -2, right: -2, width: 24, height: 24,
              borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Camera size={12} color="#667eea" />
            </button>
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: 'white' }}>
              {user.name || user.username}
            </h1>
            <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 4 }}>@{user.username}</p>
            {user.bio && <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.5, maxWidth: 400 }}>{user.bio}</p>}
            
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              {user.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, opacity: 0.9 }}>
                  <MapPin size={14} /> {user.location}
                </div>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, opacity: 0.9, color: 'white', textDecoration: 'none' }}>
                  <LinkIcon size={14} /> Website
                </a>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, opacity: 0.9 }}>
                <Calendar size={14} /> Joined {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          
          <button className="btn-secondary" onClick={openEdit} style={{ 
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', 
            color: 'white', backdropFilter: 'blur(10px)'
          }}>
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 20, position: 'relative', zIndex: 1 }}>
          {[
            { icon: Trophy, label: 'Solved Issues', value: stats.solvedIssues, color: '#fbbf24' },
            { icon: Target, label: 'Applied Issues', value: stats.appliedIssues, color: '#34d399' },
            { icon: BookOpen, label: 'Bookmarks', value: stats.totalBookmarks, color: '#60a5fa' },
            { icon: Zap, label: 'Day Streak', value: stats.streak, color: '#f87171' }
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'
              }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 12, padding: 4 }}>
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'skills', label: 'Skills', icon: Code },
          { id: 'repositories', label: 'Repositories', icon: Github },
          { id: 'activity', label: 'Activity', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none',
              background: activeTab === id ? 'white' : 'transparent',
              color: activeTab === id ? 'var(--brand)' : 'var(--text-3)',
              fontWeight: activeTab === id ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 14
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Main Info */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text)' }}>Profile Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Username', value: user.username, icon: Users },
                { label: 'Email', value: user.email || '—', icon: LinkIcon },
                { label: 'Experience Level', value: (user.experience || 'beginner').charAt(0).toUpperCase() + (user.experience || 'beginner').slice(1), icon: Award },
                { label: 'Location', value: user.location || '—', icon: MapPin },
                { label: 'Website', value: user.website || '—', icon: LinkIcon }
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface)', borderRadius: 10 }}>
                  <Icon size={16} color="var(--text-3)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {user.bio && (
              <div style={{ marginTop: 20, padding: '16px', background: 'var(--surface)', borderRadius: 10 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>About</h4>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{user.bio}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* GitHub Connection */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Github size={18} color="var(--text-2)" />
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>GitHub</h4>
              </div>
              
              {user.github_id ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <CheckCircle size={16} color="var(--accent)" />
                    <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>Connected</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{user.github_url?.split('/').pop()}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--surface)', borderRadius: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{repos.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Repos</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--surface)', borderRadius: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{stats.contributions}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Commits</div>
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', marginTop: 8, fontSize: 12 }}
                    onClick={async () => {
                      const res = await fetch('/api/user/debug', {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                      })
                      const data = await res.json()
                      console.log('Debug user data:', data)
                      alert(JSON.stringify(data, null, 2))
                    }}>
                    Debug User Data
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>Connect your GitHub account to showcase your repositories</p>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                    onClick={async () => {
                      const linkKey = 'gh_link_' + Date.now()
                      sessionStorage.setItem(linkKey, user.token)
                      const res = await fetch(`/api/auth/github?state=${linkKey}`)
                      const data = await res.json()
                      window.location.href = data.url
                    }}>
                    <Github size={14} /> Connect GitHub
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>Quick Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                  <Settings size={14} /> Account Settings
                </button>
                <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%', color: '#be123c', borderColor: '#fecdd3' }} onClick={handleLogout}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Skills & Technologies</h3>
            <button className="btn-primary" onClick={openEdit}>
              <Edit3 size={14} /> Edit Skills
            </button>
          </div>
          
          {user.skills && user.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user.skills.map(skill => (
                <span key={skill} className="badge badge-blue" style={{ fontSize: 13, padding: '6px 12px' }}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Code size={48} color="var(--text-4)" style={{ marginBottom: 16 }} />
              <h4 style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 8 }}>No skills added yet</h4>
              <p style={{ fontSize: 14, color: 'var(--text-4)', marginBottom: 16 }}>Add your programming languages and technologies</p>
              <button className="btn-primary" onClick={openEdit}>
                <Code size={14} /> Add Skills
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'repositories' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Github size={20} color="var(--text-2)" />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>GitHub Repositories</h3>
            </div>
            {user.github_url && (
              <a href={user.github_url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
                <ExternalLink size={14} /> View on GitHub
              </a>
            )}
          </div>
          
          {!user.github_url ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Github size={48} color="var(--text-4)" style={{ marginBottom: 16 }} />
              <h4 style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 8 }}>No GitHub account connected</h4>
              <p style={{ fontSize: 14, color: 'var(--text-4)', marginBottom: 16 }}>Connect your GitHub account to showcase your repositories</p>
              <button className="btn-primary" onClick={async () => {
                const linkKey = 'gh_link_' + Date.now()
                sessionStorage.setItem(linkKey, user.token)
                const res = await fetch(`/api/auth/github?state=${linkKey}`)
                const data = await res.json()
                window.location.href = data.url
              }}>
                <Github size={14} /> Connect GitHub
              </button>
            </div>
          ) : (
            <div>
              {reposLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ fontSize: 14, color: 'var(--text-4)' }}>Loading repositories...</div>
                </div>
              )}
              
              {!reposLoading && repos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <GitBranch size={48} color="var(--text-4)" style={{ marginBottom: 16 }} />
                  <h4 style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 8 }}>No public repositories</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-4)' }}>Create your first repository on GitHub to see it here</p>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {repos.map(repo => (
                  <div key={repo.name} style={{ 
                    padding: '20px', background: 'var(--surface)', borderRadius: 12,
                    border: '1px solid var(--border-soft)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <GitBranch size={16} color="var(--text-3)" />
                          {repo.name}
                        </h4>
                        {repo.description && (
                          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.4, marginBottom: 12 }}>
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <a href={repo.url} target="_blank" rel="noreferrer" style={{ 
                        color: 'var(--text-4)', flexShrink: 0, marginLeft: 12,
                        padding: '4px', borderRadius: '4px', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-4)' }}>
                      {repo.language && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)' }}></div>
                          {repo.language}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} /> {repo.stars}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <GitBranch size={12} /> {repo.forks || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Activity size={20} color="var(--text-2)" />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Recent Activity</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { type: 'bookmark', title: 'Bookmarked "React Performance Optimization"', time: '2 hours ago', icon: BookOpen },
              { type: 'apply', title: 'Applied to "Add dark mode toggle"', time: '1 day ago', icon: Target },
              { type: 'solve', title: 'Solved "Fix responsive layout issue"', time: '3 days ago', icon: CheckCircle },
              { type: 'bookmark', title: 'Bookmarked "Vue.js Component Library"', time: '1 week ago', icon: BookOpen }
            ].map((activity, index) => (
              <div key={index} style={{ 
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px', 
                background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border-soft)'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, 
                  background: activity.type === 'solve' ? 'var(--accent-soft)' : 
                             activity.type === 'apply' ? 'var(--brand-soft)' : 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <activity.icon size={18} color={
                    activity.type === 'solve' ? 'var(--accent)' : 
                    activity.type === 'apply' ? 'var(--brand)' : 'var(--text-3)'
                  } />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>
                    {activity.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-4)' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button className="btn-secondary">
              View All Activity
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>Edit Profile</h3>
              <button onClick={() => setEditing(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-4)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Display Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="your@email.com"
                  readOnly={false}
                  style={{ opacity: 1, cursor: 'text' }}
                />
                {user.github_id && <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Connected via GitHub</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself" rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Experience</label>
                <select className="input" value={experience} onChange={e => setExperience(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Location</label>
                <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Website</label>
                <input className="input" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {skills.map(skill => (
                    <span key={skill} className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 8px' }}>
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: 4 }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    className="input" 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)} 
                    placeholder="Add a skill" 
                    style={{ flex: 1 }}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button type="button" className="btn-secondary" onClick={addSkill} style={{ flexShrink: 0 }}>Add</button>
                </div>
              </div>
              {editError && <p style={{ fontSize: 13, color: '#be123c' }}>{editError}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 }} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}