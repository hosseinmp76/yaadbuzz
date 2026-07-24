import { UsersThree } from '@phosphor-icons/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQuery } from 'urql'
import { z } from 'zod'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { CREATE_TEAM, TEAMS } from '../api/queries'

const schema = z.object({
  name: z.string().min(2, 'Team name is required'),
})

type FormValues = z.infer<typeof schema>

export default function OrgPage() {
  const { orgId = '' } = useParams()
  const [{ data, fetching, error }, reexecute] = useQuery({
    query: TEAMS,
    variables: { organizationId: orgId },
  })
  const [, createTeam] = useMutation(CREATE_TEAM)
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
    const result = await createTeam({
      organizationId: orgId,
      name: values.name,
      brandColor: '#0F766E',
    })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Team created')
    reset()
    reexecute({ requestPolicy: 'network-only' })
  })

  return (
    <Layout>
      <Link to="/app" className="text-sm font-semibold text-muted hover:text-ink">
        ← Back to organizations
      </Link>
      <h1 className="page-title">Teams</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="panel stack">
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
            <UsersThree size={22} weight="duotone" className="text-brand" />
            Your teams
          </h2>
          {fetching && <p className="text-muted">Loading…</p>}
          {error && <p className="text-danger">{error.message}</p>}
          <div className="stack">
            {(data?.teams ?? []).map(
              (team: { id: string; name: string; tributesRevealed: boolean }) => (
                <Link key={team.id} to={`/teams/${team.id}`} className="list-item">
                  <div>
                    <strong>{team.name}</strong>
                    <div className="text-sm text-muted">
                      {team.tributesRevealed ? 'Tributes revealed' : 'Tributes sealed'}
                    </div>
                  </div>
                  <span className="chip">Open</span>
                </Link>
              ),
            )}
          </div>
        </section>
        <section className="panel">
          <h2 className="mb-3 font-display text-xl tracking-tight">Create team</h2>
          <form className="stack" onSubmit={onCreate}>
            <Label>
              Name
              <Input {...register('name')} />
              <FieldError message={errors.name?.message} />
            </Label>
            <Button type="submit" disabled={isSubmitting}>
              Create team
            </Button>
          </form>
        </section>
      </div>
    </Layout>
  )
}
