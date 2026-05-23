import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GitBranch, Sparkles, Zap, Target, BookmarkCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: Sparkles,     text: 'AI semantic search across 1000s of issues' },
  { icon: Zap,          text: 'Personalized recommendations based on your skills' },
  { icon: Target,       text: 'Track your contribution journey' },
  { icon: BookmarkCheck,text: 'Save and organize issues into collections' },
]

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  return (
    <div className="min-h-[calc(100vh-56px)] md:min-h-screen flex items-center justify-center px-5 py-10 page-enter">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-5">
            <GitBranch size={26} className="text-brand-400" />
          </div>

          <h1 className="font-display text-2xl font-700 text-white mb-2">Join OSS Finder</h1>
          <p className="text-sm text-white/50 mb-7">
            Connect your GitHub account to unlock personalised issue recommendations and track your open source journey.
          </p>

          {/* Features */}
          <ul className="text-left mb-7 flex flex-col gap-2.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-white/60">
                <span className="w-6 h-6 rounded-lg bg-brand-600/15 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <Icon size={12} className="text-brand-400" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <button onClick={login} className="btn-primary w-full justify-center py-3 text-base">
            <GitBranch size={16} />
            Continue with GitHub
          </button>

          <p className="text-xs text-white/25 mt-4">
            We only request read access to your public profile. We never post on your behalf.
          </p>
        </div>

        <p className="text-center text-xs text-white/25 mt-4">
          Just want to browse?{' '}
          <Link to="/explore" className="text-brand-400 hover:text-brand-300">
            Explore issues →
          </Link>
        </p>
      </div>
    </div>
  )
}
