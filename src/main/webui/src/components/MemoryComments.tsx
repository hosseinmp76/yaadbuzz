import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '../api/client'
import type { Comment } from '../api/types'
import { useApiMutation, useApiQuery } from '../api/useApi'
import { EncryptedImage } from '../crypto/EncryptedImage'
import { decryptComments, prepareCommentPayload } from '../crypto/contentCrypto'
import { uploadTeamMedia } from '../crypto/uploadEncryptedMedia'
import { Button } from './ui/Button'
import { Input, Label, Textarea } from './ui/Field'
import { cn } from '../lib/cn'
import { stackClass } from './ui/styles'

const MAX_COMMENT_IMAGES = 6

export function MemoryComments({
  memoryId,
  cryptoKey,
}: {
  memoryId: string
  cryptoKey: CryptoKey | null
}) {
  const { t } = useTranslation()
  const [{ data }, reexecute] = useApiQuery(!!memoryId, () => api.comments(memoryId), [memoryId])
  const [, addComment] = useApiMutation(
    (id: string, body: { text: string; mediaIds: string[] }) =>
      api.addComment(id, { text: body.text, parentId: null, mediaIds: body.mediaIds }),
  )
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [posting, setPosting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const canPost = !!text.trim() || files.length > 0

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const decrypted = await decryptComments(cryptoKey, data ?? [])
      if (!cancelled) setComments(decrypted)
    })()
    return () => {
      cancelled = true
    }
  }, [data, cryptoKey])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canPost) return
    setPosting(true)
    try {
      const mediaIds: string[] = []
      for (const file of files.slice(0, MAX_COMMENT_IMAGES)) {
        const uploaded = await uploadTeamMedia(file, cryptoKey)
        mediaIds.push(uploaded.id)
      }
      const encryptedText = await prepareCommentPayload(cryptoKey, text.trim())
      const result = await addComment(memoryId, { text: encryptedText, mediaIds })
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(t('team.commentPosted'))
      setText('')
      setFiles([])
      reexecute()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.requestFailed'))
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className={cn(stackClass, 'mt-3 border-t border-line pt-3')}>
      <h3 className="text-sm font-semibold text-muted">{t('team.comments')}</h3>
      {comments.length === 0 ? (
        <p className="text-sm text-muted">{t('team.noComments')}</p>
      ) : (
        <ul className={stackClass}>
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-line bg-panel-strong px-3 py-2 text-sm">
              {c.text ? <p className="whitespace-pre-wrap">{c.text}</p> : null}
              {c.pictures && c.pictures.length > 0 && (
                <div className={cn('flex flex-wrap gap-2', c.text ? 'mt-2' : '')}>
                  {c.pictures.map((pic) =>
                    pic.id && pic.url ? (
                      <EncryptedImage
                        key={pic.id}
                        url={pic.url}
                        cryptoKey={cryptoKey}
                        alt=""
                        className="h-20 w-20 rounded-lg border border-line object-cover"
                      />
                    ) : null,
                  )}
                </div>
              )}
              <div className="mt-1 text-xs text-muted">— {c.writer?.nickname}</div>
            </li>
          ))}
        </ul>
      )}
      <form className={stackClass} onSubmit={onSubmit}>
        <Label className="mb-0">
          <span className="sr-only">{t('team.addComment')}</span>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={t('team.commentPlaceholder')}
          />
        </Label>
        <Label>
          {t('team.photos')}
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) =>
              setFiles(Array.from(e.target.files ?? []).slice(0, MAX_COMMENT_IMAGES))
            }
          />
        </Label>
        {files.length > 0 && (
          <p className="text-sm text-muted">{t('team.photosSelected', { count: files.length })}</p>
        )}
        <Button type="submit" variant="secondary" disabled={posting || !canPost}>
          {posting ? t('team.posting') : t('team.postComment')}
        </Button>
      </form>
    </div>
  )
}
