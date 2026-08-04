import { Buildings, SignIn, UsersThree } from '@phosphor-icons/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../api/client'
import { useApiMutation, useApiQuery } from '../api/useApi'
import {
  AppSidebarLayout,
  SidebarNavLink,
  sidebarNavClass,
} from '../components/AppSidebar'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { Panel } from '../components/ui/Panel'
import { backLinkClass, sectionTitleClass, stackClass } from '../components/ui/styles'

type FormValues = { name: string }

export default function OrgPage() {
  const { t } = useTranslation()
  const { orgId = '' } = useParams()
  const schema = z.object({
    name: z.string().min(2, t('org.teamNameRequired')),
  })
  const [{ data: orgs }] = useApiQuery(true, () => api.myOrganizations(), [])
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
    const result = await createTeam(orgId, values.name, '#0f5f5a')
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('org.created'))
    reset()
    reexecute()
  })

  const teams = data ?? []
  const orgName = orgs?.find((o) => o.id === orgId)?.name ?? t('org.teams')

  const nav = (stacked: boolean) => (
    <nav aria-label={orgName} className={sidebarNavClass(stacked)}>
      <SidebarNavLink to="/app" icon={Buildings} stacked={stacked}>
        {t('nav.organizations')}
      </SidebarNavLink>
      <SidebarNavLink to={`/orgs/${orgId}`} active icon={UsersThree} stacked={stacked} data-tour="teams-list">
        {t('org.teams')}
      </SidebarNavLink>
      {teams.map((team) => (
        <SidebarNavLink key={team.id} to={`/teams/${team.id}`} icon={UsersThree} stacked={stacked}>
          {team.name}
        </SidebarNavLink>
      ))}
      <SidebarNavLink to="/join" icon={SignIn} stacked={stacked}>
        {t('dashboard.joinTeam')}
      </SidebarNavLink>
    </nav>
  )

  return (
    <AppSidebarLayout subtitle={orgName} nav={nav(true)} mobileNav={nav(false)}>
      <Link to="/app" className={backLinkClass}>
        ← {t('org.back')}
      </Link>
      <PageTitle>{t('org.teams')}</PageTitle>
      <p className="mt-1 text-muted">{t('org.yourTeams')}</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel className={stackClass} data-tour="teams-list">
          <h2 className={`${sectionTitleClass} flex items-center gap-2`}>
            <UsersThree size={22} weight="duotone" className="text-brand" />
            {t('org.yourTeams')}
            {teams.length > 0 && (
              <span className="ms-1 text-base font-sans font-semibold text-muted">
                ({teams.length})
              </span>
            )}
          </h2>
          {fetching && <p className="text-muted">{t('org.loading')}</p>}
          {error && <p className="text-danger">{error.message}</p>}
          {!fetching && !error && teams.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-muted">
              {t('org.yourTeams')}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="group overflow-hidden rounded-3xl border border-line bg-panel-strong shadow-sm transition hover:border-brand/30 hover:shadow-panel"
              >
                {team.coverMedia?.url ? (
                  <img
                    src={team.coverMedia.url}
                    alt=""
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-28 w-full"
                    style={{
                      background: `linear-gradient(145deg, ${team.brandColor || 'var(--brand)'} 0%, color-mix(in oklab, ${team.brandColor || 'var(--brand)'} 45%, #0a4541) 100%)`,
                    }}
                  />
                )}
                <div className="p-4">
                  <strong className="font-display text-xl tracking-tight text-brand">
                    {team.name}
                  </strong>
                  <p className="mt-1 text-sm text-muted">{t('org.tributesPublishHint')}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand group-hover:underline">
                    {t('org.open')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel data-tour="create-team" className="h-fit">
          <h2 className={`mb-4 ${sectionTitleClass}`}>{t('org.createTeam')}</h2>
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
    </AppSidebarLayout>
  )
}
