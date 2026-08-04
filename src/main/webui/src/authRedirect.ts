const NEXT_STORAGE_KEY = 'yaadbuzz.next'

/** Only allow same-app relative paths (blocks open redirects). */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null
  let decoded = value
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return null
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null
  if (decoded.includes('://')) return null
  return decoded
}

export function readNextParam(search: string): string | null {
  const params = new URLSearchParams(search)
  return safeNextPath(params.get('next'))
}

export function withNext(path: string, next: string | null | undefined): string {
  const safe = safeNextPath(next)
  if (!safe) return path
  const join = path.includes('?') ? '&' : '?'
  return `${path}${join}next=${encodeURIComponent(safe)}`
}

export function rememberNext(next: string | null | undefined) {
  const safe = safeNextPath(next)
  if (safe) {
    sessionStorage.setItem(NEXT_STORAGE_KEY, safe)
  }
}

export function clearRememberedNext() {
  sessionStorage.removeItem(NEXT_STORAGE_KEY)
}

export function takeRememberedNext(): string | null {
  const value = safeNextPath(sessionStorage.getItem(NEXT_STORAGE_KEY))
  sessionStorage.removeItem(NEXT_STORAGE_KEY)
  return value
}

export function peekRememberedNext(): string | null {
  return safeNextPath(sessionStorage.getItem(NEXT_STORAGE_KEY))
}

export function resolvePostAuthPath(search: string, fallback = '/app'): string {
  return readNextParam(search) ?? takeRememberedNext() ?? fallback
}
