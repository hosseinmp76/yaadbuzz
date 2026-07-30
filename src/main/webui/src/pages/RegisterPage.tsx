import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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
import { Seo } from '../seo/Seo'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register: registerUser, accessToken } = useAuth()
  const navigate = useNavigate()
  const schema = z.object({
    displayName: z.string().min(2),
    email: z.email(t('login.emailRequired')),
    password: z.string().min(8),
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
      displayName: '',
      email: '',
      password: '',
    },
  })

  if (accessToken) return <Navigate to="/app" replace />

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values.email, values.password, values.displayName)
      toast.success(t('register.submit'))
      void navigate('/app')
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
            {t('register.displayName')}
            <Input autoComplete="name" {...register('displayName')} />
            <FieldError message={errors.displayName?.message} />
          </Label>
          <Label>
            {t('register.email')}
            <Input type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </Label>
          <Label>
            {t('register.password')}
            <Input type="password" autoComplete="new-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </Label>
          <FieldError message={errors.root?.message} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('register.submitting') : t('register.submit')}
          </Button>
        </form>
        <p className="mt-4 text-muted">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-brand">
            {t('register.login')}
          </Link>
        </p>
      </div>
    </Layout>
  )
}
