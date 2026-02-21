import { createContext, useContext, useState, useEffect } from 'react'
import * as auth from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      if (storedToken.startsWith('mock-token-')) {
        // Clear stale mock sessions from previous version
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setCurrentUser(null)
        setRole(null)
      } else {
        const user = JSON.parse(storedUser)
        setToken(storedToken)
        setCurrentUser(user)
        setRole(user.role)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await auth.login(email, password)

    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      role: data.role,
      email: email
    }))

    setToken(data.access_token)
    setCurrentUser({ id: data.user_id, role: data.role, email: email })
    setRole(data.role)

    return data
  }

  const register = async (email, password, role) => {
    const data = await auth.register(email, password, role)
    // No auto-login: user must go to login page manually
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setCurrentUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, token, role, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
