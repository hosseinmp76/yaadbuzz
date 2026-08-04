import { AUTH_STORAGE_KEY } from './authStorage'

export const NEXT_STORAGE_KEY = 'yaadbuzz.next'

const PRESERVE_LOCAL_KEYS = new Set([
  'yaadbuzz.theme',
  'i18nextLng',
])

/** Clear auth redirect + session/local artifacts so the next login starts clean. */
export function clearClientSession() {
  try {
    sessionStorage.clear()
  } catch {
    // ignore
  }
  try {
    const keep: Array<[string, string]> = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (PRESERVE_LOCAL_KEYS.has(key)) {
        const value = localStorage.getItem(key)
        if (value != null) keep.push([key, value])
      }
    }
    localStorage.clear()
    for (const [key, value] of keep) {
      localStorage.setItem(key, value)
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(NEXT_STORAGE_KEY)
  }
}
