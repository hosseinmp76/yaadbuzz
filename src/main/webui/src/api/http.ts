import { api } from './client'
import { authHeaders } from './authHeaders'

export { ApiError, authHeaders } from './authHeaders'
export { openapi, unwrap } from './openapiClient'

export async function uploadMedia(file: File) {
  return api.uploadMedia(file)
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
