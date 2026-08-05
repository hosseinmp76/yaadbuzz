import createClient, { type Middleware } from 'openapi-fetch'
import { AUTH_STORAGE_KEY, getAccessToken } from '../authStorage'
import { ApiError } from './authHeaders'
import { clearClientSession } from '../clearClientSession'
import { refreshSession } from '../sessionRefresh'
import type { paths } from './generated/schema'

const RETRY_HEADER = 'X-Yaadbuzz-Auth-Retry'
const requestClones = new Map<string, Request>()

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
  return m.includes('not a member of this team')
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
  onRequest({ request, id }) {
    const token = getAccessToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    // Clone before fetch consumes the body so we can retry POSTs after refresh.
    requestClones.set(id, request.clone())
    return request
  },
  async onResponse({ request, response, id }) {
    const clone = requestClones.get(id)
    requestClones.delete(id)
    if (response.status !== 401 || request.headers.get(RETRY_HEADER)) {
      return response
    }
    const refreshed = await refreshSession()
    if (!refreshed) return response
    const headers = new Headers((clone ?? request).headers)
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    headers.set(RETRY_HEADER, '1')
    return fetch(new Request(clone ?? request, { headers }))
  },
  onError({ id }) {
    requestClones.delete(id)
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

/** Throw `ApiError` on non-2xx; after middleware refresh retry, clear session if still stale. */
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
