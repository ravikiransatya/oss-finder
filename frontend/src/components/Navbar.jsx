import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Search, Compass, LayoutDashboard, Bookmark,
  User, LogIn, Zap, Menu, X, Github
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/',         label: 'Home',      icon: Search,         exact: true },
  { to: '/explore',  label: 'Explore',   icon: Compass },
  { to: '/build',    label: 'Build',     icon: Zap },
  { to: '/dashboard',label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookmarks',label: 'Bookmarks', icon: Bookmark },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-soft)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>

        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textDecoration: 'none', flexShrink: 0, gap: 2,
        }}>
          <img src="/logo.png" alt="OSS Finder Logo" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--text)',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            OSS<span style={{ color: 'var(--brand)' }}>Finder</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}
          className="hidden-mobile">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {user ? (
            <>
              <Link to="/profile" className="btn-ghost" style={{ padding: '7px 10px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--brand-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: 'var(--brand)',
                }}>
                  {user.username?.[0]?.toUpperCase() || <User size={14} />}
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}
                  className="hidden-mobile">
                  {user.username}
                </span>
              </Link>
              {!user.github_id && (
                <button
                  className="btn-secondary"
                  style={{ padding: '7px 12px', fontSize: 13, gap: 6 }}
                  title="Connect GitHub"
                  onClick={async () => {
                    const linkKey = 'gh_link_' + Date.now()
                    sessionStorage.setItem(linkKey, user.token)
                    const res = await fetch(`/api/auth/github?state=${linkKey}`)
                    const data = await res.json()
                    window.location.href = data.url
                  }}
                >
                  <Github size={14} /> Connect GitHub
                </button>
              )}
              <button onClick={logout} className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 18px' }}>
              <LogIn size={14} />
              Sign in
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="btn-ghost mobile-only"
            onClick={() => setOpen(!open)}
            style={{ padding: '7px 10px' }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div style={{
          borderTop: '1px solid var(--border-soft)',
          background: '#fff',
          padding: '12px 20px 16px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 680px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 681px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </header>
  )
}
