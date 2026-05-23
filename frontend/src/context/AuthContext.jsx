import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('oss_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setUser(data) })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  // Handle GitHub OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    if (code) {
      window.history.replaceState({}, '', window.location.pathname)
      fetch(`/api/auth/github/callback?code=${code}`)
        .then(r => r.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem('oss_token', data.access_token)
            setToken(data.access_token)
            setUser(data.user)
          }
        })
        .catch(console.error)
    }
  }, [])

  const login = async () => {
    const r = await fetch('/api/auth/github')
    const data = await r.json()
    window.location.href = data.url
  }

  const logout = () => {
    localStorage.removeItem('oss_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
