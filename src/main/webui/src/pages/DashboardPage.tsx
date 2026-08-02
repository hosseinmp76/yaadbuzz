import { Buildings, Plus } from '@phosphor-icons/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../api/client'
import { useApiMutation, useApiQuery } from '../api/useApi'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { FieldError, Input, Label } from '../components/ui/Field'
import { ListItemLink } from '../components/ui/ListItem'
import { PageTitle } from '../components/ui/PageTitle'
import { Panel } from '../components/ui/Panel'
import { Stack } from '../components/ui/Stack'
import { stackClass } from '../components/ui/styles'
import { FirstVisitPrompt } from '../onboarding/FirstVisitPrompt'

type FormValues = { name: string }

export default function DashboardPage() {
  const { t } = useTranslation()
  const schema = z.object({
    name: z.string().min(2, t('dashboard.orgNameRequired')),
  })
  const [{ data, fetching, error }, reexecute] = useApiQuery(true, () => api.myOrganizations(), [])
  const [, createOrg] = useApiMutation((name: string, brandColor: string) =>
    api.createOrganization(name, brandColor),
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  const onCreate = handleSubmit(async (values) => {
    const result = await createOrg(values.name, '#0F766E')
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('dashboard.created'))
    reset()
    reexecute()
  })

  return (
    <Layout>
      <FirstVisitPrompt />
      <PageTitle>{t('dashboard.title')}</PageTitle>
      <p className="text-muted">{t('dashboard.subtitle')}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Panel className={stackClass} data-tour="orgs-list">
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
            <Buildings size={22} weight="duotone" className="text-brand" />
            {t('dashboard.organizations')}
          </h2>
          {fetching && <p className="text-muted">{t('dashboard.loading')}</p>}
          {error && <p className="text-danger">{error.message}</p>}
          <Stack>
            {(data ?? []).map((org) => (
              <ListItemLink key={org.id} to={`/orgs/${org.id}`}>
                <div>
                  <strong>{org.name}</strong>
                  <div className="text-sm text-muted">{t('dashboard.openTeams')}</div>
                </div>
                <Chip>{t('dashboard.view')}</Chip>
              </ListItemLink>
            ))}
          </Stack>
          <Link to="/join" data-tour="join-team">
            <Button variant="secondary">{t('dashboard.joinTeam')}</Button>
          </Link>
        </Panel>
        <Panel data-tour="create-org">
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl tracking-tight">
            <Plus size={22} weight="bold" className="text-brand" />
            {t('dashboard.createOrg')}
          </h2>
          <form className={stackClass} onSubmit={onCreate}>
            <Label>
              {t('dashboard.name')}
              <Input {...register('name')} />
              <FieldError message={errors.name?.message} />
            </Label>
            <Button type="submit" disabled={isSubmitting}>
              {t('dashboard.create')}
            </Button>
          </form>
        </Panel>
      </div>
    </Layout>
  )
}
