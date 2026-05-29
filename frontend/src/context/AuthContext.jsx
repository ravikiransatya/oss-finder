import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'

const AuthContext = createContext(null)

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000'

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)

  // LOAD USER
  useEffect(() => {
    const stored = localStorage.getItem('oss_user')
    
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        setUser(userData)
      } catch {
        localStorage.removeItem('oss_user')
      }
    }
    // Note: Demo user creation removed for production
    
    setLoading(false)
  }, [])

  // LOGIN
  const login = async (
    email,
    password
  ) => {

    const res = await fetch(
      `${API}/api/auth/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          email,
          password
        }),
      }
    )

    if (!res.ok) {

      const err =
        await res.json().catch(() => ({}))

      throw new Error(
        err.detail || 'Login failed'
      )
    }

    const data = await res.json()

    const userData = {
      ...data.user,
      token: data.access_token
    }

    setUser(userData)

    localStorage.setItem(
      'oss_user',
      JSON.stringify(userData)
    )

    return userData
  }

  // REGISTER
  const register = async (
    username,
    email,
    password
  ) => {

    const res = await fetch(
      `${API}/api/auth/register`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          username,
          email,
          password
        }),
      }
    )

    if (!res.ok) {

      const err =
        await res.json().catch(() => ({}))

      throw new Error(
        err.detail || 'Registration failed'
      )
    }

    return res.json()
  }

  // GOOGLE LOGIN
  const loginWithGoogle = async (code) => {
    const res = await fetch(`${API}/api/auth/google/callback?code=${code}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Google login failed')
    }
    const data = await res.json()
    const userData = { ...data.user, token: data.access_token }
    setUser(userData)
    localStorage.setItem('oss_user', JSON.stringify(userData))
    return userData
  }

  // GITHUB LOGIN + LINK (state='login' for new login, state=JWT for linking)
  const loginWithGitHub = async (code, state = 'login') => {
    try {
      const res = await fetch(`${API}/api/auth/github/callback?code=${code}&state=${encodeURIComponent(state)}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`GitHub auth failed: ${res.status}`)
      }
      
      const data = await res.json()
      
      const userData = { ...data.user, token: data.access_token }
      setUser(userData)
      localStorage.setItem('oss_user', JSON.stringify(userData))
      return userData
    } catch (error) {
      throw error
    }
  }

  // LOGOUT
  const logout = () => {

    setUser(null)

    localStorage.removeItem('oss_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)