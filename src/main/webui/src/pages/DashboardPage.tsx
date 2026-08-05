import { EnvelopeSimple, Plus, SignIn, UsersThree } from '@phosphor-icons/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
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
import { ListItem } from '../components/ui/ListItem'
import { PageTitle } from '../components/ui/PageTitle'
import { Panel } from '../components/ui/Panel'
import { Stack } from '../components/ui/Stack'
import { sectionTitleClass, stackClass } from '../components/ui/styles'
import { FirstVisitPrompt } from '../onboarding/FirstVisitPrompt'

type FormValues = { name: string }

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const schema = z.object({
    name: z.string().min(2, t('dashboard.teamNameRequired')),
  })
  const [{ data, fetching, error }, reexecute] = useApiQuery(true, () => api.myTeams(), [])
  const [{ data: invites, fetching: invitesLoading }, reexecuteInvites] = useApiQuery(
    true,
    () => api.pendingInvites(),
    [],
  )
  const [, createTeam] = useApiMutation((name: string, brandColor: string) =>
    api.createTeam(name, brandColor),
  )
  const [, acceptInvite] = useApiMutation((id: string) => api.acceptInvite(id))
  const [, rejectInvite] = useApiMutation((id: string) => api.rejectInvite(id))
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
    const result = await createTeam(values.name, '#0f5f5a')
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('dashboard.created'))
    reset()
    reexecute()
    if (result.data?.id) void navigate(`/teams/${result.data.id}`)
  })

  const onAccept = async (id: string) => {
    const result = await acceptInvite(id)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('dashboard.inviteAccepted'))
    reexecuteInvites()
    reexecute()
    const teamId = result.data?.teamId
    if (teamId) void navigate(`/teams/${teamId}`)
  }

  const onReject = async (id: string) => {
    const result = await rejectInvite(id)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('dashboard.inviteRejected'))
    reexecuteInvites()
  }

  const teams = data ?? []

  const nav = (stacked: boolean) => (
    <nav aria-label={t('dashboard.teams')} className={sidebarNavClass(stacked)}>
      <SidebarNavLink to="/app" active icon={UsersThree} stacked={stacked} data-tour="teams-list">
        {t('dashboard.teams')}
      </SidebarNavLink>
      {teams.map((team) => (
        <SidebarNavLink key={team.id} to={`/teams/${team.id}`} icon={UsersThree} stacked={stacked}>
          {team.name}
        </SidebarNavLink>
      ))}
      <SidebarNavLink to="/join" icon={SignIn} stacked={stacked} data-tour="join-team">
        {t('dashboard.joinTeam')}
      </SidebarNavLink>
    </nav>
  )

  return (
    <AppSidebarLayout
      subtitle={t('dashboard.teams')}
      nav={nav(true)}
      mobileNav={nav(false)}
    >
      <FirstVisitPrompt />
      <PageTitle>{t('dashboard.title')}</PageTitle>
      <p className="text-muted">{t('dashboard.subtitle')}</p>
      {(invitesLoading || (invites && invites.length > 0)) && (
        <Panel className={`${stackClass} mt-6`} data-tour="pending-invites">
          <h2 className={`${sectionTitleClass} flex items-center gap-2`}>
            <EnvelopeSimple size={22} weight="duotone" className="text-brand" />
            {t('dashboard.invitations')}
          </h2>
          {invitesLoading && <p className="text-muted">{t('dashboard.loading')}</p>}
          <Stack>
            {(invites ?? []).map((invite) => (
              <ListItem key={invite.id}>
                <div className="min-w-0">
                  <strong className="font-display text-lg text-brand">{invite.teamName}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="px-3.5 py-2 text-sm"
                    onClick={() => {
                      void onAccept(invite.id)
                    }}
                  >
                    {t('dashboard.acceptInvite')}
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-3.5 py-2 text-sm"
                    onClick={() => {
                      void onReject(invite.id)
                    }}
                  >
                    {t('dashboard.rejectInvite')}
                  </Button>
                </div>
              </ListItem>
            ))}
          </Stack>
        </Panel>
      )}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel className={stackClass} data-tour="teams-list">
          <h2 className={`${sectionTitleClass} flex items-center gap-2`}>
            <UsersThree size={22} weight="duotone" className="text-brand" />
            {t('dashboard.teams')}
            {teams.length > 0 && (
              <span className="ms-1 text-base font-sans font-semibold text-muted">
                ({teams.length})
              </span>
            )}
          </h2>
          {fetching && <p className="text-muted">{t('dashboard.loading')}</p>}
          {error && <p className="text-danger">{error.message}</p>}
          {!fetching && !error && teams.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-muted">
              {t('dashboard.noTeams')}
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
                  <img src={team.coverMedia.url} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <div
                    className="h-28 w-full"
                    style={{
                      background: `linear-gradient(145deg, ${team.brandColor || 'var(--brand)'} 0%, color-mix(in oklab, ${team.brandColor || 'var(--brand)'} 45%, #0a4541) 100%)`,
                    }}
                  />
                )}
                <div className="p-4">
                  <strong className="font-display text-xl tracking-tight text-brand">{team.name}</strong>
                  <p className="mt-1 text-sm text-muted">{t('dashboard.openTeam')}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand group-hover:underline">
                    {t('dashboard.view')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel data-tour="create-team" className="h-fit">
          <h2 className={`mb-4 ${sectionTitleClass} flex items-center gap-2`}>
            <Plus size={22} weight="bold" className="text-brand" />
            {t('dashboard.createTeam')}
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
    </AppSidebarLayout>
  )
}
