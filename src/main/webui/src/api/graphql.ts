import { Client, cacheExchange, fetchExchange, mapExchange } from 'urql'
import { getAccessToken } from '../auth'

export const client = new Client({
  url: '/graphql',
  exchanges: [
    cacheExchange,
    mapExchange({
      onError(error) {
        console.error(error)
      },
    }),
    fetchExchange,
  ],
  fetchOptions: () => {
    const token = getAccessToken()
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  },
})

export async function uploadMedia(file: File) {
  const token = getAccessToken()
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/media', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }))
    throw new Error(err.message || 'Upload failed')
  }
  return res.json() as Promise<{ id: string; url: string; mimeType: string }>
}

export async function downloadYearbook(exportId: string) {
  const token = getAccessToken()
  const res = await fetch(`/api/yearbooks/${exportId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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
