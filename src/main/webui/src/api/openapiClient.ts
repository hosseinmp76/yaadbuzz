import createClient, { type Middleware } from 'openapi-fetch'
import { AUTH_STORAGE_KEY, getAccessToken } from '../authStorage'
import { ApiError } from './authHeaders'
import { clearClientSession } from '../clearClientSession'
import type { paths } from './generated/schema'

function isStaleAuthError(message: string | undefined, status?: number): boolean {
  if (status === 401) return true
  if (!message) return false
  const m = message.toLowerCase()
  return (
    m.includes('user not found') ||
    m.includes('authentication required') ||
    m.includes('invalid authentication token') ||
    m.includes('unauthorized')
  )
}

export { isStaleAuthError }

export function isMembershipForbidden(message: string | undefined, status?: number): boolean {
  if (status !== 403 || !message) return false
  const m = message.toLowerCase()
  return m.includes('not a member of this team') || m.includes('not a member of this organization')
}

export function clearStoredAuthAndReload() {
  const hadAuth = !!localStorage.getItem(AUTH_STORAGE_KEY)
  clearClientSession()
  if (!hadAuth) return
  if (window.location.pathname.startsWith('/login')) return
  window.location.replace('/login')
}

export function redirectToAppIfNeeded() {
  if (window.location.pathname === '/app') return
  window.location.replace('/app')
}

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === 'string' && msg) return msg
  }
  if (typeof error === 'string' && error) return error
  return fallback
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = getAccessToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
}

/** Typed OpenAPI client (paths from `openapi-typescript`). */
export const openapi = createClient<paths>({ baseUrl: '' })
openapi.use(authMiddleware)

type ResultLike<T> = {
  data?: T
  error?: unknown
  response: Response
}

/** Throw `ApiError` on non-2xx; handle stale JWT like the old fetch helper. */
export async function unwrap<T>(resultPromise: Promise<ResultLike<T>>): Promise<T> {
  const result = await resultPromise
  if (result.response.ok) {
    return result.data as T
  }
  const message = errorMessage(result.error, result.response.statusText || 'Request failed')
  if (isStaleAuthError(message, result.response.status)) {
    clearStoredAuthAndReload()
  }
  if (isMembershipForbidden(message, result.response.status)) {
    redirectToAppIfNeeded()
  }
  throw new ApiError(result.response.status, message)
}
