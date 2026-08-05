export type AuthUser = {
  userId: string
  email: string
  displayName: string
}

export type StoredAuth = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export const AUTH_STORAGE_KEY = 'yaadbuzz.auth'
export const AUTH_UPDATED_EVENT = 'yaadbuzz:auth-updated'

function readStored(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function getAccessToken(): string | null {
  return readStored()?.accessToken ?? null
}

export function getRefreshToken(): string | null {
  return readStored()?.refreshToken ?? null
}

export function writeStoredAuth(next: StoredAuth | null) {
  if (next) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
  window.dispatchEvent(new CustomEvent(AUTH_UPDATED_EVENT))
}

/** Replace tokens after a successful refresh; keeps the existing user profile. */
export function updateStoredTokens(accessToken: string, refreshToken: string): boolean {
  const prev = readStored()
  if (!prev) return false
  writeStoredAuth({ ...prev, accessToken, refreshToken })
  return true
}
