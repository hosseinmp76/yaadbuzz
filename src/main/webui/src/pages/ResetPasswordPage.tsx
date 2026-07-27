import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { Seo } from '../seo/Seo'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const schema = z
    .object({
      newPassword: z.string().min(8),
      confirm: z.string().min(8),
    })
    .refine((v) => v.newPassword === v.confirm, {
      message: t('reset.mismatch'),
      path: ['confirm'],
    })
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirm: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      toast.error(t('reset.missingToken'))
      return
    }
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: values.newPassword }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.message || 'Request failed')
      return
    }
    toast.success(data.message || t('reset.success'))
    void navigate('/login')
  })

  return (
    <Layout>
      <Seo title={t('reset.seoTitle')} path="/reset-password" noIndex />
      <div className="mx-auto max-w-md py-8">
        <PageTitle>{t('reset.title')}</PageTitle>
        <p className="text-muted">{t('reset.subtitle')}</p>
        {!token ? (
          <p className="mt-5 text-danger">{t('reset.missingToken')}</p>
        ) : (
          <form className={cn(panelClass, stackClass, 'mt-5')} onSubmit={onSubmit}>
            <Label>
              {t('reset.password')}
              <Input type="password" autoComplete="new-password" {...register('newPassword')} />
              <FieldError message={errors.newPassword?.message} />
            </Label>
            <Label>
              {t('reset.confirm')}
              <Input type="password" autoComplete="new-password" {...register('confirm')} />
              <FieldError message={errors.confirm?.message} />
            </Label>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('reset.submitting') : t('reset.submit')}
            </Button>
          </form>
        )}
        <p className="mt-4 text-muted">
          <Link to="/login" className="font-semibold text-brand">
            {t('reset.login')}
          </Link>
        </p>
      </div>
    </Layout>
  )
}
