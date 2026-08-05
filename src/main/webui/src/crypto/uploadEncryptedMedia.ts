import { uploadMedia as uploadMediaRaw } from '../api/http'
import type { Media } from '../api/types'
import { encryptBinary } from './teamAes'

/** Upload plaintext image, or AES-GCM envelope when `cryptoKey` is set. */
export async function uploadTeamMedia(file: File, cryptoKey: CryptoKey | null): Promise<Media> {
  if (!cryptoKey) {
    return uploadMediaRaw(file)
  }
  const buf = await file.arrayBuffer()
  const blob = await encryptBinary(cryptoKey, buf, file.type || 'application/octet-stream')
  const encrypted = new File([blob], `${file.name || 'media'}.ybenc`, {
    type: 'application/octet-stream',
  })
  return uploadMediaRaw(encrypted)
}
