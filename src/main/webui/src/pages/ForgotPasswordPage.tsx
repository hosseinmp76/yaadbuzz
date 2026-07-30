import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
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

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const schema = z.object({
    email: z.email(t('login.emailRequired')),
  })
  type FormValues = z.infer<typeof schema>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.message || t('forgot.failed'))
      return
    }
    toast.success(data.message || t('forgot.success'))
  })

  return (
    <Layout>
      <Seo title={t('forgot.seoTitle')} path="/forgot-password" noIndex />
      <div className="mx-auto max-w-md py-8">
        <PageTitle>{t('forgot.title')}</PageTitle>
        <p className="text-muted">{t('forgot.subtitle')}</p>
        <form className={cn(panelClass, stackClass, 'mt-5')} onSubmit={onSubmit}>
          <Label>
            {t('forgot.email')}
            <Input type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </Label>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('forgot.submitting') : t('forgot.submit')}
          </Button>
        </form>
        <p className="mt-4 text-muted">
          <Link to="/login" className="font-semibold text-brand">
            {t('forgot.back')}
          </Link>
        </p>
      </div>
    </Layout>
  )
}
