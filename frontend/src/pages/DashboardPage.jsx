import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame, BookmarkCheck, CheckCircle2, Target,
  Sparkles, ArrowRight, LogIn, TrendingUp
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchUserStats, fetchRecommendations } from '../api/issues'
import IssueCard from '../components/IssueCard'
import { IssueSkeleton, StatSkeleton } from '../components/Skeleton'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <Icon size={18} className={`${color} mb-2`} />
      <span className="font-display text-3xl font-700 text-white">{value ?? '—'}</span>
      <span className="text-xs text-white/40 mt-0.5">{label}</span>
    </div>
  )
}

export default function DashboardPage() {
  const { user, token, login } = useAuth()
  const [userStats, setUserStats]   = useState(null)
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!user || !token) { setLoading(false); return }

    Promise.all([
      fetchUserStats(token),
      fetchRecommendations({
        skills:     user.skills || [],
        experience: user.experience || 'beginner',
        limit:      6,
      }),
    ])
      .then(([stats, recs]) => {
        setUserStats(stats)
        setRecommended(recs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, token])

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-20 flex flex-col items-center justify-center text-center page-enter">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-5">
          <TrendingUp size={28} className="text-brand-400" />
        </div>
        <h2 className="font-display text-2xl font-700 text-white mb-2">Your Dashboard</h2>
        <p className="text-white/40 text-sm mb-6 max-w-xs">
          Sign in with GitHub to see your bookmarks, contribution history, and personalized recommendations.
        </p>
        <button onClick={login} className="btn-primary">
          <LogIn size={15} />
          Sign in with GitHub
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 page-enter">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full border-2 border-brand-500/30" />
        <div>
          <h1 className="font-display text-2xl font-700 text-white">
            Welcome back, {user.name?.split(' ')[0] || user.username}
          </h1>
          <p className="text-sm text-white/40">@{user.username} · {user.experience}</p>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Flame}         label="Day Streak"    value={userStats?.streak_days}  color="text-orange-400" />
            <StatCard icon={BookmarkCheck} label="Saved"         value={userStats?.saved}         color="text-brand-400" />
            <StatCard icon={Target}        label="Applied"       value={userStats?.applied}       color="text-yellow-400" />
            <StatCard icon={CheckCircle2}  label="Solved"        value={userStats?.solved}        color="text-accent-400" />
          </>
        )}
      </section>

      {/* Skills */}
      {user.skills?.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-lg font-700 text-white mb-3">Your Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map(skill => (
              <span key={skill} className="badge bg-brand-600/15 text-brand-300 border border-brand-500/20 text-sm py-1 px-3">
                {skill}
              </span>
            ))}
            <Link to="/profile" className="badge bg-white/5 text-white/40 border border-white/8 text-sm py-1 px-3 hover:text-white/70 transition-colors">
              + Edit skills
            </Link>
          </div>
        </section>
      )}

      {/* Recommended */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-400" />
            <h2 className="font-display text-lg font-700 text-white">Recommended for You</h2>
          </div>
          <Link to="/explore" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
            Explore all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <IssueSkeleton key={i} />)}
          </div>
        ) : recommended.length === 0 ? (
          <div className="card p-8 text-center text-white/30 text-sm">
            No recommendations yet — add skills in your profile to get personalised suggestions.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map(issue => <IssueCard key={issue.id} issue={issue} />)}
          </div>
        )}
      </section>
    </div>
  )
}
