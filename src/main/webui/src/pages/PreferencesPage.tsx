import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from 'urql'
import { z } from 'zod'
import Layout from '../components/Layout'
import { ThemePicker } from '../components/ThemePicker'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { useAuth } from '../auth'
import { Seo } from '../seo/Seo'
import { UPDATE_MY_PROFILE } from '../api/queries'

const schema = z.object({
  displayName: z.string().min(2, 'Display name is required'),
})

type FormValues = z.infer<typeof schema>

export default function PreferencesPage() {
  const { user, updateUser } = useAuth()
  const [, updateMyProfile] = useMutation(UPDATE_MY_PROFILE)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { displayName: user?.displayName ?? '' },
  })

  const onSave = handleSubmit(async (values) => {
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
    toast.success('Preferences saved')
  })

  return (
    <Layout>
      <Seo title="Preferences" path="/preferences" noIndex />
      <PageTitle>Preferences</PageTitle>
      <p className="text-muted">Your account appearance and display name.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <form className={cn(panelClass, stackClass)} onSubmit={onSave}>
          <h2 className="font-display text-xl tracking-tight">Profile</h2>
          <Label>
            Display name
            <Input autoComplete="name" {...register('displayName')} />
            <FieldError message={errors.displayName?.message} />
          </Label>
          <p className="text-sm text-muted">
            Signed in as <strong className="text-ink">{user?.email}</strong>
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save profile'}
          </Button>
        </form>

        <section className={panelClass}>
          <ThemePicker />
        </section>
      </div>
    </Layout>
  )
}
