import { useCallback, useEffect, useState } from 'react'
import { generateTeamAesKey, importTeamKeyBase64 } from './teamAes'
import {
  clearTeamKey,
  hasTeamKey,
  loadTeamKey,
  peekTeamKeyBase64,
  saveTeamKey,
  saveTeamKeyBase64,
} from './teamKeyStore'
import {
  clearTeamKeyVerified,
  markTeamKeyVerified,
  verifyTeamAesKey,
  WrongTeamKeyError,
} from './verifyTeamKey'

export function useTeamCrypto(teamId: string | undefined, encryptionEnabled: boolean | undefined) {
  const enabled = !!encryptionEnabled
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [ready, setReady] = useState(!enabled)
  const [missing, setMissing] = useState(false)
  const [keyRejected, setKeyRejected] = useState(false)

  const rejectWrongKey = useCallback(async () => {
    if (!teamId) return
    clearTeamKeyVerified(teamId)
    await clearTeamKey(teamId)
    setKey(null)
    setMissing(enabled)
    setKeyRejected(true)
  }, [teamId, enabled])

  const refresh = useCallback(async () => {
    if (!teamId || !enabled) {
      setKey(null)
      setMissing(false)
      setReady(true)
      setKeyRejected(false)
      return
    }
    setReady(false)
    const loaded = await loadTeamKey(teamId)
    if (!loaded) {
      setKey(null)
      setMissing(true)
      setReady(true)
      return
    }
    // Unlock UI immediately from IndexedDB; verify against server ciphertext in the background.
    setKey(loaded)
    setMissing(false)
    setKeyRejected(false)
    setReady(true)
    try {
      await verifyTeamAesKey(teamId, loaded)
    } catch {
      clearTeamKeyVerified(teamId)
      await clearTeamKey(teamId)
      setKey(null)
      setMissing(true)
      setKeyRejected(true)
    }
  }, [teamId, enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const unlock = useCallback(
    async (keyB64: string) => {
      if (!teamId) throw new Error('No team')
      setKeyRejected(false)
      let imported: CryptoKey
      try {
        imported = await importTeamKeyBase64(keyB64)
      } catch {
        throw new WrongTeamKeyError()
      }
      try {
        await verifyTeamAesKey(teamId, imported, { force: true })
      } catch {
        clearTeamKeyVerified(teamId)
        await clearTeamKey(teamId)
        setKey(null)
        setMissing(true)
        setKeyRejected(true)
        throw new WrongTeamKeyError()
      }
      await saveTeamKeyBase64(teamId, keyB64.trim())
      markTeamKeyVerified(teamId)
      setKey(imported)
      setMissing(false)
      setKeyRejected(false)
      return imported
    },
    [teamId],
  )

  const lockLocal = useCallback(async () => {
    if (!teamId) return
    clearTeamKeyVerified(teamId)
    await clearTeamKey(teamId)
    setKey(null)
    setMissing(enabled)
    setKeyRejected(false)
  }, [teamId, enabled])

  const createAndStore = useCallback(async () => {
    if (!teamId) throw new Error('No team')
    const generated = await generateTeamAesKey()
    const exported = await saveTeamKey(teamId, generated)
    markTeamKeyVerified(teamId)
    setKey(generated)
    setMissing(false)
    setKeyRejected(false)
    return exported
  }, [teamId])

  return {
    enabled,
    ready,
    missing: enabled && missing,
    keyRejected: enabled && keyRejected,
    key: enabled ? key : null,
    refresh,
    unlock,
    rejectWrongKey,
    lockLocal,
    createAndStore,
    hasKey: () => (teamId ? hasTeamKey(teamId) : Promise.resolve(false)),
    peekKey: () => (teamId ? peekTeamKeyBase64(teamId) : Promise.resolve(null)),
  }
}
