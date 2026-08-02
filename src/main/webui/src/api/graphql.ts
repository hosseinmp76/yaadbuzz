import { Client, cacheExchange, fetchExchange, mapExchange } from 'urql'
import { AUTH_STORAGE_KEY, getAccessToken } from '../authStorage'

export const client = new Client({
  url: '/graphql',
  exchanges: [
    cacheExchange,
    mapExchange({
      onError(error) {
        if (isStaleAuthError(error.message)) {
          clearStoredAuthAndReload()
          return
        }
        console.error(error)
      },
    }),
    fetchExchange,
  ],
  fetchOptions: (): RequestInit => ({
    headers: authHeaders(),
  }),
})

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** After DB reseed/wipe, JWTs still in localStorage point at deleted users. */
function isStaleAuthError(message: string | undefined): boolean {
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

export async function uploadMedia(file: File) {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/media', {
    method: 'POST',
    headers: authHeaders(),
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }))
    throw new Error(err.message || 'Upload failed')
  }
  return res.json() as Promise<{ id: string; url: string; mimeType: string }>
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
