import { UsersThree } from '@phosphor-icons/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
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

type FormValues = { name: string }

export default function OrgPage() {
  const { t } = useTranslation()
  const { orgId = '' } = useParams()
  const schema = z.object({
    name: z.string().min(2, t('org.teamNameRequired')),
  })
  const [{ data, fetching, error }, reexecute] = useApiQuery(
    !!orgId,
    () => api.teams(orgId),
    [orgId],
  )
  const [, createTeam] = useApiMutation((organizationId: string, name: string, brandColor: string) =>
    api.createTeam(organizationId, name, brandColor),
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
    const result = await createTeam(orgId, values.name, '#0F766E')
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('org.created'))
    reset()
    reexecute()
  })

  return (
    <Layout>
      <Link to="/app" className="text-sm font-semibold text-muted hover:text-ink">
        {t('org.back')}
      </Link>
      <PageTitle>{t('org.teams')}</PageTitle>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel className={stackClass} data-tour="teams-list">
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
            <UsersThree size={22} weight="duotone" className="text-brand" />
            {t('org.yourTeams')}
          </h2>
          {fetching && <p className="text-muted">{t('org.loading')}</p>}
          {error && <p className="text-danger">{error.message}</p>}
          <Stack>
            {(data ?? []).map((team) => (
              <ListItemLink key={team.id} to={`/teams/${team.id}`}>
                <div>
                  <strong>{team.name}</strong>
                  <div className="text-sm text-muted">{t('org.tributesPublishHint')}</div>
                </div>
                <Chip>{t('org.open')}</Chip>
              </ListItemLink>
            ))}
          </Stack>
        </Panel>
        <Panel data-tour="create-team">
          <h2 className="mb-3 font-display text-xl tracking-tight">{t('org.createTeam')}</h2>
          <form className={stackClass} onSubmit={onCreate}>
            <Label>
              {t('org.name')}
              <Input {...register('name')} />
              <FieldError message={errors.name?.message} />
            </Label>
            <Button type="submit" disabled={isSubmitting}>
              {t('org.createTeam')}
            </Button>
          </form>
        </Panel>
      </div>
    </Layout>
  )
}
