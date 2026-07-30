import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import Layout from '../components/Layout'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ThemePicker } from '../components/ThemePicker'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { useAuth } from '../auth'
import { Seo } from '../seo/Seo'
import { UPDATE_MY_PROFILE } from '../api/queries'

export default function PreferencesPage() {
  const { t } = useTranslation()
  const { user, updateUser, accessToken } = useAuth()
  const [, updateMyProfile] = useMutation(UPDATE_MY_PROFILE)

  const profileSchema = z.object({
    displayName: z.string().min(2, t('preferences.displayName')),
  })
  type ProfileValues = z.infer<typeof profileSchema>

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
      confirm: z.string().min(8),
    })
    .refine((v) => v.newPassword === v.confirm, {
      message: t('reset.mismatch'),
      path: ['confirm'],
    })
  type PasswordValues = z.infer<typeof passwordSchema>

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { displayName: user?.displayName ?? '' },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  })

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    const result = await updateMyProfile({ displayName: values.displayName })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    const updated = result.data?.updateMyProfile
    if (updated) {
      updateUser({
        userId: updated.id,
        email: updated.email,
        displayName: updated.displayName,
      })
    }
    toast.success(t('preferences.saved'))
  })

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.message || t('common.requestFailed'))
      return
    }
    passwordForm.reset()
    toast.success(data.message || t('preferences.passwordChanged'))
  })

  return (
    <Layout>
      <Seo title={t('preferences.seoTitle')} path="/preferences" noIndex />
      <PageTitle>{t('preferences.title')}</PageTitle>
      <p className="text-muted">{t('preferences.subtitle')}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <form className={cn(panelClass, stackClass)} onSubmit={onSaveProfile}>
          <h2 className="font-display text-xl tracking-tight">{t('preferences.profile')}</h2>
          <Label>
            {t('preferences.displayName')}
            <Input autoComplete="name" {...profileForm.register('displayName')} />
            <FieldError message={profileForm.formState.errors.displayName?.message} />
          </Label>
          <p className="text-sm text-muted">
            {t('preferences.signedInAs')}{' '}
            <strong className="text-ink">{user?.email}</strong>
          </p>
          <Button type="submit" disabled={profileForm.formState.isSubmitting}>
            {profileForm.formState.isSubmitting ? t('preferences.saving') : t('preferences.saveProfile')}
          </Button>
        </form>

        <section className={cn(panelClass, stackClass)}>
          <h2 className="font-display text-xl tracking-tight">{t('preferences.language')}</h2>
          <p className="text-sm text-muted">{t('preferences.languageHint')}</p>
          <LanguageSwitcher />
          <ThemePicker />
        </section>

        <form className={cn(panelClass, stackClass, 'lg:col-span-2')} onSubmit={onChangePassword}>
          <h2 className="font-display text-xl tracking-tight">{t('preferences.password')}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Label>
              {t('preferences.currentPassword')}
              <Input
                type="password"
                autoComplete="current-password"
                {...passwordForm.register('currentPassword')}
              />
              <FieldError message={passwordForm.formState.errors.currentPassword?.message} />
            </Label>
            <Label>
              {t('preferences.newPassword')}
              <Input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('newPassword')}
              />
              <FieldError message={passwordForm.formState.errors.newPassword?.message} />
            </Label>
            <Label>
              {t('preferences.confirmPassword')}
              <Input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('confirm')}
              />
              <FieldError message={passwordForm.formState.errors.confirm?.message} />
            </Label>
          </div>
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting
              ? t('preferences.changing')
              : t('preferences.changePassword')}
          </Button>
        </form>
      </div>
    </Layout>
  )
}
