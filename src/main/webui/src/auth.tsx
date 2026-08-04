import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AUTH_STORAGE_KEY, type AuthUser, type StoredAuth } from './authStorage'
import { clearClientSession } from './clearClientSession'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string) => Promise<string>
  completeOAuth: (code: string) => Promise<void>
  updateUser: (user: AuthUser) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function persistAuth(next: StoredAuth | null) {
  if (next) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

async function authRequest(path: string, body: unknown): Promise<StoredAuth> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || 'Request failed')
  }
  const data = await res.json()
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      userId: data.userId,
      email: data.email,
      displayName: data.displayName,
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredAuth | null>(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    persistAuth(stored)
  }, [stored])

  const value = useMemo<AuthState>(() => ({
    accessToken: stored?.accessToken ?? null,
    refreshToken: stored?.refreshToken ?? null,
    user: stored?.user ?? null,
    async login(email, password) {
      const next = await authRequest('/api/auth/login', { email, password })
      // Sync to localStorage before React re-renders so API middleware sees the token.
      persistAuth(next)
      setStored(next)
    },
    async register(email) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Request failed')
      }
      return typeof data.message === 'string' ? data.message : ''
    },
    async completeOAuth(code) {
      const next = await authRequest('/api/auth/oauth/exchange', { code })
      persistAuth(next)
      setStored(next)
    },
    updateUser(nextUser) {
      setStored((prev) => {
        if (!prev) return prev
        const next = { ...prev, user: nextUser }
        persistAuth(next)
        return next
      })
    },
    async logout() {
      clearClientSession()
      setStored(null)
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch {
        // Local JWT already cleared; cookie clear is best-effort.
      }
    },
  }), [stored])

  return (
    <AuthContext.Provider value={value}>
      {/* Remount the tree per user so page state cannot leak across accounts. */}
      <div key={stored?.user.userId ?? 'signed-out'}>{children}</div>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}
