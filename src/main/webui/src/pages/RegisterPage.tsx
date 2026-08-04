import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation } from 'react-router-dom'
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
import { rememberNext, peekRememberedNext, readNextParam, withNext } from '../authRedirect'
import { SocialLoginButtons } from '../components/SocialLoginButtons'
import { Seo } from '../seo/Seo'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register: registerUser, accessToken } = useAuth()
  const location = useLocation()
  const schema = z.object({
    email: z.email(t('login.emailRequired')),
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
      rememberNext(new URLSearchParams(location.search).get('next'))
      const message = await registerUser(values.email)
      toast.success(message || t('register.success'))
    } catch (err) {
      const message = err instanceof Error ? err.message : t('register.failed')
      setError('root', { message })
      toast.error(message)
    }
  })

  return (
    <Layout>
      <Seo title={t('register.seoTitle')} path="/register" />
      <div className="mx-auto max-w-md py-8">
        <PageTitle>{t('register.title')}</PageTitle>
        <p className="text-muted">{t('register.subtitle')}</p>
        <form className={cn(panelClass, stackClass, 'mt-5')} onSubmit={onSubmit}>
          <Label>
            {t('register.email')}
            <Input type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </Label>
          <FieldError message={errors.root?.message} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('register.submitting') : t('register.submit')}
          </Button>
          <SocialLoginButtons />
        </form>
        <p className="mt-4 text-muted">
          {t('register.haveAccount')}{' '}
          <Link
            to={withNext('/login', new URLSearchParams(location.search).get('next'))}
            className="font-semibold text-brand"
          >
            {t('register.login')}
          </Link>
        </p>
      </div>
    </Layout>
  )
}
