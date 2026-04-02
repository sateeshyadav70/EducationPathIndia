import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const storageKey = 'authUser'
const usersKey = 'appUsers'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed) setUser(parsed)
      } catch {
        setUser(null)
      }
    }
  }, [])

  const loadUsers = () => {
    const stored = window.localStorage.getItem(usersKey)
    if (!stored) return []
    try {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const saveUsers = (users) => {
    window.localStorage.setItem(usersKey, JSON.stringify(users))
  }

  const signup = (payload) => {
    const email = payload.email.trim().toLowerCase()
    const name = payload.name.trim()
    const password = payload.password
    if (!email || !name || !password) {
      setAuthError('Please fill all fields.')
      return { ok: false }
    }
    const users = loadUsers()
    const exists = users.find((item) => item.email.toLowerCase() === email)
    if (exists) {
      setAuthError('User already exists. Please login.')
      return { ok: false }
    }
    const nextUser = { id: email, name, email, password }
    saveUsers([nextUser, ...users])
    setUser({ id: nextUser.id, name: nextUser.name, email: nextUser.email })
    window.localStorage.setItem(storageKey, JSON.stringify({ id: nextUser.id, name, email }))
    setAuthError('')
    return { ok: true }
  }

  const login = (payload) => {
    const email = payload.email.trim().toLowerCase()
    const password = payload.password
    const users = loadUsers()
    const match = users.find((item) => item.email.toLowerCase() === email && item.password === password)
    if (!match) {
      setAuthError('Invalid credentials. Please check ID and password.')
      return { ok: false }
    }
    const nextUser = { id: match.id, name: match.name, email: match.email }
    setUser(nextUser)
    window.localStorage.setItem(storageKey, JSON.stringify(nextUser))
    setAuthError('')
    return { ok: true }
  }

  const logout = () => {
    setUser(null)
    setAuthError('')
    window.localStorage.removeItem(storageKey)
  }

  const value = useMemo(
    () => ({ user, login, signup, logout, authError, setAuthError }),
    [user, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
