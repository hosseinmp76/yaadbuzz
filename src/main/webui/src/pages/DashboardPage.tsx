import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'urql'
import Layout from '../components/Layout'
import { CREATE_ORG, MY_ORGS } from '../api/queries'

export default function DashboardPage() {
  const [{ data, fetching, error }, reexecute] = useQuery({ query: MY_ORGS })
  const [, createOrg] = useMutation(CREATE_ORG)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const result = await createOrg({ name, brandColor: '#0F766E' })
    if (result.error) {
      setFormError(result.error.message)
      return
    }
    setName('')
    reexecute({ requestPolicy: 'network-only' })
  }

  return (
    <Layout>
      <h1 className="page-title">Your organizations</h1>
      <p className="muted">Start an organization, then create teams for each yearbook.</p>
      <div className="grid-2" style={{ marginTop: '1.25rem' }}>
        <section className="panel stack">
          <h2>Organizations</h2>
          {fetching && <p className="muted">Loading…</p>}
          {error && <p className="error">{error.message}</p>}
          <div className="list">
            {(data?.myOrganizations ?? []).map((org: any) => (
              <Link key={org.id} to={`/orgs/${org.id}`} className="list-item">
                <div>
                  <strong>{org.name}</strong>
                  <div className="muted">Open teams</div>
                </div>
                <span className="chip">View</span>
              </Link>
            ))}
          </div>
          <Link to="/join"><button className="secondary">Join a team with invite code</button></Link>
        </section>
        <section className="panel">
          <h2>Create organization</h2>
          <form onSubmit={onCreate}>
            <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            {formError && <p className="error">{formError}</p>}
            <button type="submit">Create</button>
          </form>
        </section>
      </div>
    </Layout>
  )
}
