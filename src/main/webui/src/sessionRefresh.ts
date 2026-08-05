import { getAccessToken, getRefreshToken, updateStoredTokens } from './authStorage'

let refreshInFlight: Promise<boolean> | null = null

function accessTokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    return typeof json.exp === 'number' ? json.exp * 1000 : null
  } catch {
    return null
  }
}

/** True when there is no access token, it is malformed, or it expires within `skewMs`. */
export function accessTokenNeedsRefresh(skewMs = 60_000): boolean {
  const token = getAccessToken()
  if (!token) return !!getRefreshToken()
  const exp = accessTokenExpiresAt(token)
  if (exp == null) return true
  return Date.now() + skewMs >= exp
}

/**
 * Exchange the stored refresh JWT for a new access (+ refresh) pair.
 * Concurrent callers share one in-flight request.
 */
export async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false
      const data = (await res.json()) as {
        accessToken?: string
        refreshToken?: string
      }
      if (!data.accessToken || !data.refreshToken) return false
      return updateStoredTokens(data.accessToken, data.refreshToken)
    } catch {
      return false
    }
  })().finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}

/** Refresh when the access JWT is missing/expired/near expiry. */
export async function ensureFreshSession(): Promise<boolean> {
  if (!getRefreshToken()) return false
  if (!accessTokenNeedsRefresh()) return true
  return refreshSession()
}
