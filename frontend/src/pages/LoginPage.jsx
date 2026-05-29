import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE = '/api'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

const SOCIAL = [
  { id: 'google', icon: <GoogleIcon />, label: 'Continue with Google' },
]

export default function LoginPage() {
  const [tab, setTab]           = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone] = useState(false) // show check-email screen after register
  const [error, setError]       = useState('')

  const { login, register } = useAuth()
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
        nav('/')
      } else {
        await register(username, email, password)
        setDone(true)
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const socialBtn = {
    width: '100%', height: 44,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    cursor: 'pointer', fontSize: 14, fontWeight: 500,
    color: 'var(--text-2)', fontFamily: 'var(--font-body)',
    transition: 'background 0.15s',
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#f0f7ff 0%,#fff 100%)', padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Mail size={26} color="var(--brand)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 10 }}>Check your email</h2>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>
          We sent a verification link to <strong>{email}</strong>.<br />Click it to activate your account.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 60%)',
    }}>

      {/* Left panel */}
      <div className="login-left" style={{
        flex: 1, display: 'none', flexDirection: 'column',
        justifyContent: 'center', padding: '64px 56px',
        borderRight: '1px solid var(--border-soft)', background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>OSS Finder</span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 42px)', color: 'var(--text)', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
          Your next open-source<br />
          <span style={{ color: 'var(--brand)', fontStyle: 'italic' }}>adventure</span> awaits
        </h2>

        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 360 }}>
          Discover beginner-friendly issues, AI-curated projects, and contribution paths tailored to your skills.
        </p>

        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: '12,400+', desc: 'Open issues indexed' },
            { label: '94%',     desc: 'AI match accuracy'  },
            { label: '2,100+',  desc: 'Repos tracked'      },
          ].map(({ label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} color="var(--brand)" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{label}</p>
                <p style={{ fontSize: 13, color: 'var(--text-4)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>OSS Finder</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
            {tab === 'login' ? 'Sign in to continue your OSS journey' : 'Join thousands of contributors today'}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', padding: 3, marginBottom: 20 }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                style={{
                  flex: 1, border: 'none', borderRadius: 8, padding: '9px',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                  transition: 'all 0.15s',
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? 'var(--text)' : 'var(--text-3)',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '11px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tab === 'register' && (
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="input" />
            )}
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required className="input"
                style={{ paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-4)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <Link to="/auth/forgot-password" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 14, marginTop: 2, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-4)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SOCIAL.map(({ id, icon, label }) => (
              <button
                key={id}
                type="button"
                style={socialBtn}
                onClick={() => {
                  fetch('/api/auth/google').then(r => r.json()).then(d => window.location.href = d.url)
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-4)', fontSize: 12, marginTop: 20, lineHeight: 1.6 }}>
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .login-left { display: flex !important; } }
      `}</style>
    </div>
  )
}
