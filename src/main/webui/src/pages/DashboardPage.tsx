import { Buildings, EnvelopeSimple, Plus, SignIn } from '@phosphor-icons/react'
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
    name: z.string().min(2, t('dashboard.orgNameRequired')),
  })
  const [{ data, fetching, error }, reexecute] = useApiQuery(true, () => api.myOrganizations(), [])
  const [{ data: invites, fetching: invitesLoading }, reexecuteInvites] = useApiQuery(
    true,
    () => api.pendingInvites(),
    [],
  )
  const [, createOrg] = useApiMutation((name: string, brandColor: string) =>
    api.createOrganization(name, brandColor),
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
    const result = await createOrg(values.name, '#0f5f5a')
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('dashboard.created'))
    reset()
    reexecute()
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

  const orgs = data ?? []

  const nav = (stacked: boolean) => (
    <nav aria-label={t('dashboard.organizations')} className={sidebarNavClass(stacked)}>
      <SidebarNavLink to="/app" active icon={Buildings} stacked={stacked} data-tour="orgs-list">
        {t('dashboard.organizations')}
      </SidebarNavLink>
      {orgs.map((org) => (
        <SidebarNavLink key={org.id} to={`/orgs/${org.id}`} icon={Buildings} stacked={stacked}>
          {org.name}
        </SidebarNavLink>
      ))}
      <SidebarNavLink to="/join" icon={SignIn} stacked={stacked} data-tour="join-team">
        {t('dashboard.joinTeam')}
      </SidebarNavLink>
    </nav>
  )

  return (
    <AppSidebarLayout
      subtitle={t('dashboard.organizations')}
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
                  <div className="text-sm text-muted">
                    {t('dashboard.inviteFromOrg', { org: invite.organizationName })}
                  </div>
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
        <Panel className={stackClass} data-tour="orgs-list">
          <h2 className={`${sectionTitleClass} flex items-center gap-2`}>
            <Buildings size={22} weight="duotone" className="text-brand" />
            {t('dashboard.organizations')}
            {orgs.length > 0 && (
              <span className="ms-1 text-base font-sans font-semibold text-muted">
                ({orgs.length})
              </span>
            )}
          </h2>
          {fetching && <p className="text-muted">{t('dashboard.loading')}</p>}
          {error && <p className="text-danger">{error.message}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {orgs.map((org) => (
              <Link
                key={org.id}
                to={`/orgs/${org.id}`}
                className="group overflow-hidden rounded-3xl border border-line bg-panel-strong shadow-sm transition hover:border-brand/30 hover:shadow-panel"
              >
                <div
                  className="h-20 w-full"
                  style={{
                    background: `linear-gradient(145deg, ${org.brandColor || 'var(--brand)'} 0%, color-mix(in oklab, ${org.brandColor || 'var(--brand)'} 45%, #0a4541) 100%)`,
                  }}
                />
                <div className="p-4">
                  <strong className="font-display text-xl tracking-tight text-brand">{org.name}</strong>
                  <p className="mt-1 text-sm text-muted">{t('dashboard.openTeams')}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand group-hover:underline">
                    {t('dashboard.view')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel data-tour="create-org" className="h-fit">
          <h2 className={`mb-4 ${sectionTitleClass} flex items-center gap-2`}>
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
    </AppSidebarLayout>
  )
}
