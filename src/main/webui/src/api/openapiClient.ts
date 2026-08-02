import createClient, { type Middleware } from 'openapi-fetch'
import { AUTH_STORAGE_KEY, getAccessToken } from '../authStorage'
import { ApiError } from './authHeaders'
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

function clearStoredAuthAndReload() {
  const hadAuth = !!localStorage.getItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(AUTH_STORAGE_KEY)
  if (!hadAuth) return
  if (window.location.pathname.startsWith('/login')) return
  window.location.replace('/login')
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
  throw new ApiError(result.response.status, message)
}
