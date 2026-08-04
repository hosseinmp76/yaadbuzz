import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { useAuth } from '../auth'
import { rememberNext, peekRememberedNext, readNextParam, resolvePostAuthPath, withNext } from '../authRedirect'
import { SocialLoginButtons } from '../components/SocialLoginButtons'
import { Seo } from '../seo/Seo'
import { useEffect } from 'react'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login, accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const schema = z.object({
    email: z.email(t('login.emailRequired')),
    password: z.string().min(1, t('login.passwordRequired')),
  })
  type FormValues = z.infer<typeof schema>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    rememberNext(new URLSearchParams(location.search).get('next'))
  }, [location.search])

  if (accessToken) {
    return <Navigate to={readNextParam(location.search) ?? peekRememberedNext() ?? '/app'} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password)
      toast.success(t('login.success'))
      void navigate(resolvePostAuthPath(location.search))
    } catch (err) {
      const message = err instanceof Error ? err.message : t('login.failed')
      setError('root', { message })
      toast.error(message)
    }
  })

  return (
    <Layout>
      <Seo
        title={t('login.seoTitle')}
        description={t('login.seoDescription')}
        path="/login"
      />
      <div className="mx-auto max-w-md py-8">
        <PageTitle>{t('login.title')}</PageTitle>
        <p className="text-muted">{t('login.subtitle')}</p>
        <form className={cn(panelClass, stackClass, 'mt-5')} onSubmit={onSubmit}>
          <Label>
            {t('login.email')}
            <Input type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </Label>
          <Label>
            {t('login.password')}
            <Input type="password" autoComplete="current-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </Label>
          <FieldError message={errors.root?.message} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('login.submitting') : t('login.submit')}
          </Button>
          <SocialLoginButtons />
        </form>
        <p className="mt-4 text-muted">
          <Link to="/forgot-password" className="font-semibold text-brand">
            {t('login.forgot')}
          </Link>
        </p>
        <p className="mt-2 text-muted">
          {t('login.noAccount')}{' '}
          <Link
            to={withNext('/register', new URLSearchParams(location.search).get('next'))}
            className="font-semibold text-brand"
          >
            {t('login.register')}
          </Link>
        </p>
      </div>
    </Layout>
  )
}
