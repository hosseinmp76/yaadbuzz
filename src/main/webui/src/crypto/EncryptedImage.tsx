import { useEffect, useState } from 'react'
import { decryptBinary, looksLikeEncryptedBinary } from './teamAes'

type Props = {
  url: string
  cryptoKey: CryptoKey | null
  alt?: string
  className?: string
}

/**
 * Fetches media from its public URL (MinIO CORS required for decrypt).
 * Encrypted envelopes are decrypted in-browser with the team AES key.
 */
export function EncryptedImage({ url, cryptoKey, alt = '', className }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    setFailed(false)
    setSrc(null)

    void (async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error('fetch failed')
        const buf = await res.arrayBuffer()
        if (looksLikeEncryptedBinary(buf)) {
          if (!cryptoKey) {
            if (!cancelled) setFailed(true)
            return
          }
          const { mimeType, bytes } = await decryptBinary(cryptoKey, buf)
          objectUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
          if (!cancelled) setSrc(objectUrl)
          return
        }
        if (!cancelled) setSrc(url)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url, cryptoKey])

  if (failed) {
    return (
      <div
        className={className}
        style={{ background: 'color-mix(in oklab, var(--muted) 25%, transparent)' }}
        aria-label={alt || 'Encrypted image'}
      />
    )
  }
  if (!src) {
    return (
      <div
        className={className}
        style={{ background: 'color-mix(in oklab, var(--line) 80%, transparent)' }}
        aria-hidden
      />
    )
  }
  return <img src={src} alt={alt} className={className} />
}
