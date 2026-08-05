import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Field'
import { panelClass, sectionTitleClass, stackClass } from '../components/ui/styles'
import { cn } from '../lib/cn'

type Props = {
  onUnlock: (keyB64: string) => Promise<unknown>
  showReveal?: string | null
  /** Prefill error after a stored key failed decryption. */
  rejected?: boolean
}

/** Prompt to paste the shared team AES key (IndexedDB only). */
export function TeamEncryptionUnlock({ onUnlock, showReveal, rejected }: Props) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(rejected ? t('encryption.wrongKey') : null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (rejected) setError(t('encryption.wrongKey'))
  }, [rejected, t])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onUnlock(value)
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'WrongTeamKeyError'
          ? t('encryption.wrongKey')
          : err instanceof Error
            ? err.message
            : t('encryption.invalidKey')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={cn(panelClass, stackClass, 'border-brand/40')}>
      <h2 className={sectionTitleClass}>{t('encryption.unlockTitle')}</h2>
      <p className="text-muted">{t('encryption.unlockBody')}</p>
      {showReveal && (
        <div className={stackClass}>
          <p className="text-sm font-semibold text-ink">{t('encryption.yourKey')}</p>
          <code className="break-all rounded-xl border border-line bg-panel px-3 py-2 text-xs">
            {showReveal}
          </code>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(showReveal).then(() => {
                setCopied(true)
                window.setTimeout(() => setCopied(false), 2000)
              })
            }}
          >
            {copied ? t('encryption.copied') : t('encryption.copyKey')}
          </Button>
          <p className="text-sm text-muted">{t('encryption.saveKeyHint')}</p>
        </div>
      )}
      <form className={stackClass} onSubmit={submit}>
        <Label>
          {t('encryption.keyLabel')}
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('encryption.keyPlaceholder')}
            autoComplete="off"
            spellCheck={false}
            required
          />
        </Label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={busy || !value.trim()}>
          {busy ? t('encryption.unlocking') : t('encryption.unlock')}
        </Button>
      </form>
    </section>
  )
}
