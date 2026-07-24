import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'urql'
import Layout from '../components/Layout'
import { CREATE_TEAM, TEAMS } from '../api/queries'

export default function OrgPage() {
  const { orgId = '' } = useParams()
  const [{ data, fetching, error }, reexecute] = useQuery({
    query: TEAMS,
    variables: { organizationId: orgId },
  })
  const [, createTeam] = useMutation(CREATE_TEAM)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const result = await createTeam({ organizationId: orgId, name, brandColor: '#0F766E' })
    if (result.error) {
      setFormError(result.error.message)
      return
    }
    setName('')
    reexecute({ requestPolicy: 'network-only' })
  }

  return (
    <Layout>
      <Link to="/app" className="muted">← Back to organizations</Link>
      <h1 className="page-title">Teams</h1>
      <div className="grid-2">
        <section className="panel stack">
          {fetching && <p className="muted">Loading…</p>}
          {error && <p className="error">{error.message}</p>}
          <div className="list">
            {(data?.teams ?? []).map((team: any) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="list-item">
                <div>
                  <strong>{team.name}</strong>
                  <div className="muted">{team.tributesRevealed ? 'Tributes revealed' : 'Tributes sealed'}</div>
                </div>
                <span className="chip">Open</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Create team</h2>
          <form onSubmit={onCreate}>
            <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            {formError && <p className="error">{formError}</p>}
            <button type="submit">Create team</button>
          </form>
        </section>
      </div>
    </Layout>
  )
}
