import { api } from '../api/client'
import { decryptText, isEncryptedText } from './teamAes'

export class WrongTeamKeyError extends Error {
  constructor(message = 'Wrong team encryption key') {
    super(message)
    this.name = 'WrongTeamKeyError'
  }
}

/** Teams whose key already passed decrypt checks this page session. */
const verifiedTeamIds = new Set<string>()

export function markTeamKeyVerified(teamId: string) {
  verifiedTeamIds.add(teamId)
}

export function clearTeamKeyVerified(teamId: string) {
  verifiedTeamIds.delete(teamId)
}

export function isTeamKeyVerified(teamId: string) {
  return verifiedTeamIds.has(teamId)
}

/** Collect a few ciphertext samples from the team (if any exist). */
async function sampleEncryptedTexts(teamId: string): Promise<string[]> {
  const samples: string[] = []
  const [tributes, memories] = await Promise.all([
    api.tributes(teamId, { first: 20 }),
    api.memories(teamId, { first: 20 }),
  ])
  for (const t of tributes.items) {
    if (isEncryptedText(t.text)) samples.push(t.text!)
  }
  for (const m of memories.items) {
    if (isEncryptedText(m.title)) samples.push(m.title!)
    if (isEncryptedText(m.bodyText)) samples.push(m.bodyText!)
  }
  return samples
}

/**
 * Ensures `key` can decrypt existing team ciphertext.
 * If the team has no encrypted content yet, verification is skipped.
 * Pass `force` after a fresh unlock; otherwise skips teams already verified this session.
 */
export async function verifyTeamAesKey(
  teamId: string,
  key: CryptoKey,
  options?: { force?: boolean },
): Promise<void> {
  if (!options?.force && verifiedTeamIds.has(teamId)) return
  const samples = await sampleEncryptedTexts(teamId)
  if (samples.length === 0) {
    verifiedTeamIds.add(teamId)
    return
  }
  try {
    await decryptText(key, samples[0])
    verifiedTeamIds.add(teamId)
  } catch {
    verifiedTeamIds.delete(teamId)
    throw new WrongTeamKeyError()
  }
}

export function isWrongTeamKeyError(err: unknown): boolean {
  return (
    err instanceof WrongTeamKeyError ||
    (err instanceof Error && err.name === 'WrongTeamKeyError') ||
    (err instanceof DOMException &&
      (err.name === 'OperationError' || err.name === 'InvalidAccessError'))
  )
}
