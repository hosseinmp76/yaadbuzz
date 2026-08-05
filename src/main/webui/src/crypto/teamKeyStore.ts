import { exportTeamKeyBase64, importTeamKeyBase64 } from './teamAes'

const DB_NAME = 'yaadbuzz-crypto'
const STORE = 'team-keys'
const DB_VERSION = 1

type KeyRow = { teamId: string; keyB64: string }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'teamId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveTeamKey(teamId: string, key: CryptoKey): Promise<string> {
  const keyB64 = await exportTeamKeyBase64(key)
  const db = await openDb()
  try {
    await idbReq(db.transaction(STORE, 'readwrite').objectStore(STORE).put({ teamId, keyB64 }))
  } finally {
    db.close()
  }
  return keyB64
}

export async function saveTeamKeyBase64(teamId: string, keyB64: string): Promise<CryptoKey> {
  const trimmed = keyB64.trim()
  const key = await importTeamKeyBase64(trimmed)
  const db = await openDb()
  try {
    await idbReq(db.transaction(STORE, 'readwrite').objectStore(STORE).put({ teamId, keyB64: trimmed }))
  } finally {
    db.close()
  }
  return key
}

export async function loadTeamKey(teamId: string): Promise<CryptoKey | null> {
  const db = await openDb()
  try {
    const row = await idbReq<KeyRow | undefined>(
      db.transaction(STORE, 'readonly').objectStore(STORE).get(teamId),
    )
    if (!row?.keyB64) return null
    try {
      return await importTeamKeyBase64(row.keyB64)
    } catch {
      return null
    }
  } finally {
    db.close()
  }
}

export async function hasTeamKey(teamId: string): Promise<boolean> {
  return (await loadTeamKey(teamId)) != null
}

export async function clearTeamKey(teamId: string): Promise<void> {
  const db = await openDb()
  try {
    await idbReq(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(teamId))
  } finally {
    db.close()
  }
}

export async function peekTeamKeyBase64(teamId: string): Promise<string | null> {
  const db = await openDb()
  try {
    const row = await idbReq<KeyRow | undefined>(
      db.transaction(STORE, 'readonly').objectStore(STORE).get(teamId),
    )
    return row?.keyB64 ?? null
  } finally {
    db.close()
  }
}
