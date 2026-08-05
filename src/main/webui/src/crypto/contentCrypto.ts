import type { Comment, Memory, Tribute } from '../api/types'
import { decryptMaybe, encryptMaybe, isEncryptedText } from './teamAes'
import { WrongTeamKeyError } from './verifyTeamKey'

export async function prepareMemoryPayload(
  key: CryptoKey | null,
  title: string,
  bodyText: string,
): Promise<{ title: string; bodyText: string }> {
  return {
    title: await encryptMaybe(key, title),
    bodyText: await encryptMaybe(key, bodyText),
  }
}

export async function prepareTributePayload(key: CryptoKey | null, text: string): Promise<string> {
  return encryptMaybe(key, text)
}

export async function prepareCommentPayload(key: CryptoKey | null, text: string): Promise<string> {
  return encryptMaybe(key, text)
}

async function decryptField(key: CryptoKey | null, value: string): Promise<string> {
  try {
    return await decryptMaybe(key, value)
  } catch {
    if (key && isEncryptedText(value)) throw new WrongTeamKeyError()
    throw new WrongTeamKeyError()
  }
}

export async function decryptMemory(key: CryptoKey | null, memory: Memory): Promise<Memory> {
  return {
    ...memory,
    title: await decryptField(key, memory.title ?? ''),
    bodyText: await decryptField(key, memory.bodyText ?? ''),
  }
}

export async function decryptTribute(key: CryptoKey | null, tribute: Tribute): Promise<Tribute> {
  return {
    ...tribute,
    text: await decryptField(key, tribute.text ?? ''),
  }
}

export async function decryptComment(key: CryptoKey | null, comment: Comment): Promise<Comment> {
  return {
    ...comment,
    text: await decryptField(key, comment.text ?? ''),
  }
}

export async function decryptMemories(key: CryptoKey | null, items: Memory[]): Promise<Memory[]> {
  return Promise.all(items.map((m) => decryptMemory(key, m)))
}

export async function decryptTributes(key: CryptoKey | null, items: Tribute[]): Promise<Tribute[]> {
  return Promise.all(items.map((t) => decryptTribute(key, t)))
}

export async function decryptComments(key: CryptoKey | null, items: Comment[]): Promise<Comment[]> {
  return Promise.all(items.map((c) => decryptComment(key, c)))
}

/** Decrypt yearbook tribute/memory/comment text fields (images stay URL-based). */
export async function decryptYearbookContent<
  T extends {
    members: Array<{ tributes: Array<{ text: string }> }>
    memories: Array<{
      title?: string
      body: string
      comments?: Array<{ text: string }>
    }>
  },
>(key: CryptoKey | null, yearbook: T): Promise<T> {
  if (!key) return yearbook
  const members = await Promise.all(
    yearbook.members.map(async (m) => ({
      ...m,
      tributes: await Promise.all(
        m.tributes.map(async (tr) => ({
          ...tr,
          text: await decryptField(key, tr.text ?? ''),
        })),
      ),
    })),
  )
  const memories = await Promise.all(
    yearbook.memories.map(async (mem) => ({
      ...mem,
      title: mem.title != null ? await decryptField(key, mem.title) : mem.title,
      body: await decryptField(key, mem.body ?? ''),
      comments: mem.comments
        ? await Promise.all(
            mem.comments.map(async (c) => ({
              ...c,
              text: await decryptField(key, c.text ?? ''),
            })),
          )
        : mem.comments,
    })),
  )
  return { ...yearbook, members, memories }
}
