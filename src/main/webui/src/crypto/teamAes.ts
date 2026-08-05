/** Client-side AES-GCM for optional team encryption. Keys never leave the browser. */

const TEXT_PREFIX = 'yb1.'
const BINARY_MAGIC = new Uint8Array([0x59, 0x42, 0x31]) // YB1
const BINARY_VERSION = 1

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export async function generateTeamAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}

export async function exportTeamKeyBase64(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key))
  return toBase64Url(raw)
}

export async function importTeamKeyBase64(encoded: string): Promise<CryptoKey> {
  const raw = fromBase64Url(encoded.trim())
  if (raw.byteLength !== 32) {
    throw new Error('Invalid team key (expected 256-bit AES key)')
  }
  const copy = new Uint8Array(raw)
  return crypto.subtle.importKey('raw', copy, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
}

export function isEncryptedText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(TEXT_PREFIX)
}

export async function encryptText(key: CryptoKey, plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plain)
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded))
  return `${TEXT_PREFIX}${toBase64Url(iv)}.${toBase64Url(ct)}`
}

export async function decryptText(key: CryptoKey, value: string): Promise<string> {
  if (!isEncryptedText(value)) return value
  const parts = value.slice(TEXT_PREFIX.length).split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid encrypted text')
  }
  const iv = fromBase64Url(parts[0])
  const ct = fromBase64Url(parts[1])
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(ct),
  )
  return new TextDecoder().decode(plain)
}

export async function encryptMaybe(key: CryptoKey | null, plain: string): Promise<string> {
  if (!key) return plain
  return encryptText(key, plain)
}

export async function decryptMaybe(key: CryptoKey | null, value: string): Promise<string> {
  if (!key || !isEncryptedText(value)) return value
  return decryptText(key, value)
}

/** Binary envelope: magic(3) + ver(1) + mimeLen(1) + mime + iv(12) + ciphertext */
export async function encryptBinary(
  key: CryptoKey,
  bytes: ArrayBuffer,
  mimeType: string,
): Promise<Blob> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes))
  const mimeBytes = new TextEncoder().encode(mimeType.slice(0, 255))
  const out = new Uint8Array(3 + 1 + 1 + mimeBytes.length + 12 + ct.length)
  let o = 0
  out.set(BINARY_MAGIC, o)
  o += 3
  out[o++] = BINARY_VERSION
  out[o++] = mimeBytes.length
  out.set(mimeBytes, o)
  o += mimeBytes.length
  out.set(iv, o)
  o += 12
  out.set(ct, o)
  return new Blob([out], { type: 'application/octet-stream' })
}

export function looksLikeEncryptedBinary(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 3 + 1 + 1 + 12) return false
  const u = new Uint8Array(buf)
  return u[0] === 0x59 && u[1] === 0x42 && u[2] === 0x31
}

export async function decryptBinary(
  key: CryptoKey,
  buf: ArrayBuffer,
): Promise<{ mimeType: string; bytes: ArrayBuffer }> {
  const u = new Uint8Array(buf)
  if (!looksLikeEncryptedBinary(buf) || u[3] !== BINARY_VERSION) {
    throw new Error('Not an encrypted media blob')
  }
  const mimeLen = u[4]
  let o = 5
  const mimeType = new TextDecoder().decode(u.subarray(o, o + mimeLen))
  o += mimeLen
  const iv = new Uint8Array(u.subarray(o, o + 12))
  o += 12
  const ct = new Uint8Array(u.subarray(o))
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return { mimeType, bytes: plain }
}
