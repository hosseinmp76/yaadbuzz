import { AUTH_STORAGE_KEY, getAccessToken } from '../authStorage'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken()
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

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

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string }
    return body.message || res.statusText || 'Request failed'
  } catch {
    return res.statusText || 'Request failed'
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(authHeaders(init.headers))
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    const message = await readErrorMessage(res)
    if (isStaleAuthError(message, res.status)) {
      clearStoredAuthAndReload()
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

export async function uploadMedia(file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<{ id: string; url: string; mimeType: string }>('/api/media', {
    method: 'POST',
    body,
  })
}

export async function downloadYearbook(exportId: string) {
  const res = await fetch(`/api/yearbooks/${exportId}/download`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    throw new Error('Download failed')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yaadbuzz-${exportId}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
