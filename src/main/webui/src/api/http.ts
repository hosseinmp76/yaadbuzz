import { api } from './client'

export { ApiError, authHeaders } from './authHeaders'
export { openapi, unwrap } from './openapiClient'

export async function uploadMedia(file: File) {
  return api.uploadMedia(file)
}
