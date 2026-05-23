import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Zap, GitBranch, Users, ArrowRight, Star, TrendingUp } from 'lucide-react'
import { fetchStats, fetchIssues } from '../api/issues'
import IssueCard from '../components/IssueCard'
import { IssueSkeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user, login } = useAuth()
  const [stats, setStats]   = useState(null)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchStats(), fetchIssues({ limit: 6, sort: 'quality' })])
      .then(([s, i]) => { setStats(s); setIssues(i.results || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 page-enter">
      {/* Hero */}
      <section className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/15 border border-brand-500/25 text-brand-300 text-xs font-medium mb-6">
          <Sparkles size={12} />
          AI-Powered Open Source Discovery
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-800 text-white mb-5 leading-tight tracking-tight">
          Find your first{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
            contribution
          </span>
        </h1>

        <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-8">
          Discover beginner-friendly open source issues matched to your skills,
          powered by semantic AI search and GitHub intelligence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/explore" className="btn-primary text-base px-6 py-3">
            <Zap size={16} />
            Start Exploring
          </Link>
          {!user && (
            <button onClick={login} className="btn-ghost border border-white/10 text-white/70 hover:text-white px-6 py-3 rounded-xl text-sm">
              Sign in with GitHub
            </button>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {[
          { label: 'Open Issues',  value: stats?.total_issues,  icon: GitBranch, color: 'text-brand-400' },
          { label: 'Repositories', value: stats?.total_repos,   icon: Star,      color: 'text-yellow-400' },
          { label: 'Contributors', value: stats?.total_users,   icon: Users,     color: 'text-accent-400' },
          { label: 'Languages',    value: stats?.languages?.length, icon: TrendingUp, color: 'text-pink-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon size={18} className={`${color} mb-2`} />
            <span className="font-display text-3xl font-700 text-white">
              {value != null ? value.toLocaleString() : '—'}
            </span>
            <span className="text-xs text-white/40 mt-0.5">{label}</span>
          </div>
        ))}
      </section>

      {/* Featured Issues */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-700 text-white">Top Quality Issues</h2>
          <Link to="/explore" className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <IssueSkeleton key={i} />)}
          </div>
        ) : issues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
          </div>
        ) : (
          <div className="card p-10 text-center text-white/30">
            <GitBranch size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No issues yet — run the fetch script to populate the database.</p>
            <code className="block mt-3 text-xs bg-white/5 px-3 py-2 rounded-lg text-brand-300 font-mono">
              python scripts/fetch_issues.py
            </code>
          </div>
        )}
      </section>

      {/* Languages bar */}
      {stats?.languages?.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-700 text-white mb-5">Issues by Language</h2>
          <div className="card p-5">
            <div className="flex flex-wrap gap-3">
              {stats.languages.map(({ language, count }) => (
                <Link
                  key={language}
                  to={`/explore?language=${language}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <span className="w-2 h-2 rounded-full bg-accent-400/70" />
                  <span className="text-sm text-white/70 group-hover:text-white">{language}</span>
                  <span className="text-xs text-white/30 tabular-nums">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
