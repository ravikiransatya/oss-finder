import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, CheckCircle, XCircle, Loader } from 'lucide-react'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')
  const called = useRef(false)
  const nav = useNavigate()

  useEffect(() => {
    if (called.current) return
    called.current = true

    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.message?.includes('verified')) {
          setStatus('success')
          setMessage('Your email has been verified! You can now sign in.')
        } else {
          setStatus('error')
          setMessage(data.detail || 'Verification failed.')
        }
      })
      .catch(() => { setStatus('error'); setMessage('Something went wrong.') })
  }, [])

  const icon = status === 'loading'
    ? <Loader size={28} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
    : status === 'success'
    ? <CheckCircle size={28} color="var(--accent)" />
    : <XCircle size={28} color="#be123c" />

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#f0f7ff 0%,#fff 100%)', padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          {icon}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 10 }}>
          {status === 'loading' ? 'Verifying…' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 28 }}>{message}</p>
        {status === 'success' && (
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            Sign In
          </Link>
        )}
        {status === 'error' && (
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            Back to Login
          </Link>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
