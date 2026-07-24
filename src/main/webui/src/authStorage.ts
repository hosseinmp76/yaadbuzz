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

export function getAccessToken(): string | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return (JSON.parse(raw) as StoredAuth).accessToken
  } catch {
    return null
  }
}
