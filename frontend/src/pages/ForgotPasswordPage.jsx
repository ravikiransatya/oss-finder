import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowLeft, Mail } from 'lucide-react'
import API_BASE_URL from '../config/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#f0f7ff 0%,#fff 100%)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>OSS Finder</span>
        </div>

        {done ? (
          <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Mail size={26} color="var(--brand)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 10 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 24 }}>
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>Forgot password?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 28 }}>Enter your email and we'll send you a reset link.</p>

            {error && (
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '11px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 14, color: 'var(--text-3)', textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
