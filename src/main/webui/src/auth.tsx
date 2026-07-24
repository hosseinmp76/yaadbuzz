import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type AuthUser = {
  userId: string
  email: string
  displayName: string
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const STORAGE_KEY = 'yaadbuzz.auth'

type Stored = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

async function authRequest(path: string, body: unknown): Promise<Stored> {
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
  const [stored, setStored] = useState<Stored | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [stored])

  const value = useMemo<AuthState>(() => ({
    accessToken: stored?.accessToken ?? null,
    refreshToken: stored?.refreshToken ?? null,
    user: stored?.user ?? null,
    async login(email, password) {
      setStored(await authRequest('/api/auth/login', { email, password }))
    },
    async register(email, password, displayName) {
      setStored(await authRequest('/api/auth/register', { email, password, displayName }))
    },
    logout() {
      setStored(null)
    },
  }), [stored])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}

export function getAccessToken() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return (JSON.parse(raw) as Stored).accessToken
  } catch {
    return null
  }
}
