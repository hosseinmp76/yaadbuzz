import { Buildings, Plus } from '@phosphor-icons/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQuery } from 'urql'
import { z } from 'zod'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { FieldError, Input, Label } from '../components/ui/Field'
import { ListItemLink } from '../components/ui/ListItem'
import { PageTitle } from '../components/ui/PageTitle'
import { Panel } from '../components/ui/Panel'
import { Stack } from '../components/ui/Stack'
import { stackClass } from '../components/ui/styles'
import { CREATE_ORG, MY_ORGS } from '../api/queries'

const schema = z.object({
  name: z.string().min(2, 'Organization name is required'),
})

type FormValues = z.infer<typeof schema>

export default function DashboardPage() {
  const [{ data, fetching, error }, reexecute] = useQuery({ query: MY_ORGS })
  const [, createOrg] = useMutation(CREATE_ORG)
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
    const result = await createOrg({ name: values.name, brandColor: '#0F766E' })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Organization created')
    reset()
    reexecute({ requestPolicy: 'network-only' })
  })

  return (
    <Layout>
      <PageTitle>Your organizations</PageTitle>
      <p className="text-muted">Start an organization, then create teams for each yearbook.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Panel className={stackClass}>
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
            <Buildings size={22} weight="duotone" className="text-brand" />
            Organizations
          </h2>
          {fetching && <p className="text-muted">Loading…</p>}
          {error && <p className="text-danger">{error.message}</p>}
          <Stack>
            {(data?.myOrganizations ?? []).map((org: { id: string; name: string }) => (
              <ListItemLink key={org.id} to={`/orgs/${org.id}`}>
                <div>
                  <strong>{org.name}</strong>
                  <div className="text-sm text-muted">Open teams</div>
                </div>
                <Chip>View</Chip>
              </ListItemLink>
            ))}
          </Stack>
          <Link to="/join">
            <Button variant="secondary">Join a team with invite code</Button>
          </Link>
        </Panel>
        <Panel>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl tracking-tight">
            <Plus size={22} weight="bold" className="text-brand" />
            Create organization
          </h2>
          <form className={stackClass} onSubmit={onCreate}>
            <Label>
              Name
              <Input {...register('name')} />
              <FieldError message={errors.name?.message} />
            </Label>
            <Button type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </form>
        </Panel>
      </div>
    </Layout>
  )
}
