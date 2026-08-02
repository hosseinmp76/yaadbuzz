import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '../api/client'
import { useApiMutation, useApiQuery } from '../api/useApi'
import { Button } from './ui/Button'
import { Label, Textarea } from './ui/Field'
import { cn } from '../lib/cn'
import { stackClass } from './ui/styles'

export function MemoryComments({ memoryId }: { memoryId: string }) {
  const { t } = useTranslation()
  const [{ data }, reexecute] = useApiQuery(!!memoryId, () => api.comments(memoryId), [memoryId])
  const [, addComment] = useApiMutation((id: string, text: string) =>
    api.addComment(id, { text, parentId: null, mediaIds: [] }),
  )
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const comments = data ?? []

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    const result = await addComment(memoryId, text.trim())
    setPosting(false)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('team.commentPosted'))
    setText('')
    reexecute()
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
              <p className="whitespace-pre-wrap">{c.text}</p>
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
            required
          />
        </Label>
        <Button type="submit" variant="secondary" disabled={posting || !text.trim()}>
          {posting ? t('team.posting') : t('team.postComment')}
        </Button>
      </form>
    </div>
  )
}
