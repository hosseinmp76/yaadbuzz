import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../auth'
import { Button } from './ui/Button'

type Providers = {
  google: boolean
  github: boolean
  telegram: boolean
  telegramBotUsername?: string | null
}

type TelegramUser = {
  id: number | string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number | string
  hash: string
}

declare global {
  interface Window {
    onYaadbuzzTelegramAuth?: (user: TelegramUser) => void
  }
}

export function SocialLoginButtons() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { completeTelegram } = useAuth()
  const [providers, setProviders] = useState<Providers | null>(null)
  const [busy, setBusy] = useState(false)
  const telegramHost = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    void fetch('/api/auth/oauth/providers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Providers | null) => {
        if (!cancelled && data) {
          setProviders({
            google: !!data.google,
            github: !!data.github,
            telegram: !!data.telegram,
            telegramBotUsername: data.telegramBotUsername ?? null,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProviders({ google: false, github: false, telegram: false })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    window.onYaadbuzzTelegramAuth = (user: TelegramUser) => {
      if (busy) return
      setBusy(true)
      void completeTelegram({
        id: String(user.id),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_date: String(user.auth_date),
        hash: user.hash,
      })
        .then(() => {
          toast.success(t('login.success'))
          void navigate('/app')
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : t('oauth.failed')
          toast.error(message)
        })
        .finally(() => setBusy(false))
    }
    return () => {
      delete window.onYaadbuzzTelegramAuth
    }
  }, [busy, completeTelegram, navigate, t])

  useEffect(() => {
    const host = telegramHost.current
    const bot = providers?.telegramBotUsername
    if (!host || !providers?.telegram || !bot) {
      return
    }
    host.replaceChildren()
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', bot)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-request-access', 'write')
    // Callback in the opener window — not data-auth-url (that finishes inside a popup that closes).
    script.setAttribute('data-onauth', 'onYaadbuzzTelegramAuth(user)')
    if (i18n.language?.startsWith('fa')) {
      script.setAttribute('data-lang', 'fa')
    }
    host.appendChild(script)
    return () => {
      host.replaceChildren()
    }
  }, [providers, i18n.language])

  if (
    !providers ||
    (!providers.google && !providers.github && !providers.telegram)
  ) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center gap-3 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>{t('login.orContinueWith')}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {providers.google && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={() => {
              window.location.assign('/api/auth/oauth/google')
            }}
          >
            {t('login.google')}
          </Button>
        )}
        {providers.github && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={() => {
              window.location.assign('/api/auth/oauth/github')
            }}
          >
            {t('login.github')}
          </Button>
        )}
      </div>
      {providers.telegram && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted">{t('login.telegram')}</p>
          <div
            ref={telegramHost}
            className={`flex min-h-10 justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`}
          />
        </div>
      )}
    </div>
  )
}
