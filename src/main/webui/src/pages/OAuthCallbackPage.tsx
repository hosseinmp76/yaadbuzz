import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Layout from '../components/Layout'
import { PageTitle } from '../components/ui/PageTitle'
import { useAuth } from '../auth'
import { Seo } from '../seo/Seo'

export default function OAuthCallbackPage() {
  const { t } = useTranslation()
  const { accessToken, completeOAuth } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = params.get('code')
    if (!code) {
      setError(t('oauth.missingCode'))
      return
    }
    let cancelled = false
    void completeOAuth(code)
      .then(() => {
        if (cancelled) return
        toast.success(t('login.success'))
        void navigate('/app', { replace: true })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : t('oauth.failed')
        setError(message)
        toast.error(message)
      })
    return () => {
      cancelled = true
    }
  }, [completeOAuth, navigate, params, t])

  if (accessToken && !error) {
    return <Navigate to="/app" replace />
  }

  return (
    <Layout>
      <Seo title={t('oauth.seoTitle')} path="/oauth/callback" noIndex />
      <div className="mx-auto max-w-md py-8">
        <PageTitle>{t('oauth.title')}</PageTitle>
        {error ? (
          <p className="mt-4 text-danger">
            {error}{' '}
            <Link to="/login" className="font-semibold text-brand">
              {t('oauth.backToLogin')}
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-muted">{t('oauth.working')}</p>
        )}
      </div>
    </Layout>
  )
}
