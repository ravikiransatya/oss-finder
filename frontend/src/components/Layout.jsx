import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home,
  Compass,
  LayoutDashboard,
  Bookmark,
  Wrench,
  User,
  LogOut,
  LogIn,
  GitBranch,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/',          label: 'Home',      icon: Home         },
  { to: '/build',     label: 'Build',      icon: Wrench },
  { to: '/explore',   label: 'Explore',   icon: Compass      },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark     },
]

export default function Layout() {
  const { user, login, logout, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/8 py-6 px-4 sticky top-0 h-screen">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <GitBranch size={16} className="text-white" />
          </div>
          <span className="font-display font-700 text-lg text-white tracking-tight">OSS Finder</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/8 pt-4">
          {loading ? null : user ? (
            <div className="flex flex-col gap-2">
              <NavLink to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/8 transition-colors">
                <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name || user.username}</p>
                  <p className="text-xs text-white/40 truncate">@{user.username}</p>
                </div>
              </NavLink>
              <button onClick={logout} className="nav-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={login} className="btn-primary w-full justify-center">
              <LogIn size={15} />
              Sign in with GitHub
            </button>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-surface-950/80 backdrop-blur border-b border-white/8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <GitBranch size={14} className="text-white" />
          </div>
          <span className="font-display font-700 text-base">OSS Finder</span>
        </Link>
        <button onClick={() => setMobileOpen(v => !v)} className="text-white/60 hover:text-white">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-surface-950/95 pt-16 px-4 pb-6 flex flex-col">
          <nav className="flex flex-col gap-1 mb-6">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to} to={to} end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-link text-base py-3 ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-3 mt-auto">
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name || user.username}</p>
                <p className="text-xs text-white/40">@{user.username}</p>
              </div>
              <button onClick={logout} className="text-red-400 text-sm"><LogOut size={16}/></button>
            </div>
          ) : (
            <button onClick={login} className="btn-primary justify-center">
              <LogIn size={15}/> Sign in with GitHub
            </button>
          )}
        </div>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
