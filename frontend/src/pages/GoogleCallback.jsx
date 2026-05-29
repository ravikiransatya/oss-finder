import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap } from 'lucide-react'

export default function GoogleCallback() {
  const { loginWithGoogle } = useAuth()
  const nav = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) { nav('/login'); return }

    loginWithGoogle(code)
      .then(() => nav('/'))
      .catch(() => nav('/login?error=google'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'linear-gradient(180deg,#f0f7ff 0%,#fff 100%)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.2s ease-in-out infinite' }}>
        <Zap size={22} color="#fff" strokeWidth={2.5} />
      </div>
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Signing you in with Google…</p>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.93)} }`}</style>
    </div>
  )
}
