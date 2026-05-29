import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap } from 'lucide-react'

export default function GitHubCallback() {
  const { loginWithGitHub } = useAuth()
  const nav = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const params = new URLSearchParams(window.location.search)
    const code  = params.get('code')
    const state = params.get('state') || 'login'

    if (!code) { nav('/login'); return }

    // If state looks like our link key, retrieve the actual JWT from sessionStorage
    let resolvedState = 'login'
    if (state.startsWith('gh_link_')) {
      const token = sessionStorage.getItem(state)
      sessionStorage.removeItem(state)
      resolvedState = token || 'login'
    }

    loginWithGitHub(code, resolvedState)
      .then(() => resolvedState === 'login' ? nav('/') : nav('/profile'))
      .catch(() => nav('/login?error=github'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'linear-gradient(180deg,#f0f7ff 0%,#fff 100%)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.2s ease-in-out infinite' }}>
        <Zap size={22} color="#fff" strokeWidth={2.5} />
      </div>
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Connecting GitHub…</p>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.93)} }`}</style>
    </div>
  )
}
