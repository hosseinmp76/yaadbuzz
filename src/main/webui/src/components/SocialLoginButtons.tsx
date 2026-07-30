import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

type Providers = { google: boolean; github: boolean }

export function SocialLoginButtons() {
  const { t } = useTranslation()
  const [providers, setProviders] = useState<Providers | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetch('/api/auth/oauth/providers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Providers | null) => {
        if (!cancelled && data) setProviders(data)
      })
      .catch(() => {
        if (!cancelled) setProviders({ google: false, github: false })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!providers || (!providers.google && !providers.github)) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center gap-3 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>{t('login.orContinueWith')}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {providers.google && (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
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
            className="w-full"
            onClick={() => {
              window.location.assign('/api/auth/oauth/github')
            }}
          >
            {t('login.github')}
          </Button>
        )}
      </div>
    </div>
  )
}
