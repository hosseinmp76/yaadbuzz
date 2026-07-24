import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useClient, useMutation, useQuery } from 'urql'
import Layout from '../components/Layout'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { downloadYearbook } from '../api/graphql'
import {
  CREATE_INVITE,
  CREATE_MEMORY,
  CREATE_TOPIC,
  MEMORIES,
  REQUEST_EXPORT,
  SEARCH,
  TEAM,
  TEAM_MEMBERS,
  TOPICS,
  TOPIC_STANDINGS,
  UPDATE_TEAM_SETTINGS,
  VOTE_TOPIC,
  YEARBOOK_EXPORTS,
} from '../api/queries'

type Tab = 'members' | 'memories' | 'topics' | 'search' | 'yearbook' | 'settings'

export default function TeamPage() {
  const { teamId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'members'
  const setTab = (next: Tab) => setParams({ tab: next })

  const [{ data: teamData }] = useQuery({ query: TEAM, variables: { id: teamId } })
  const team = teamData?.team

  return (
    <Layout>
      <Link to={team ? `/orgs/${team.organizationId}` : '/app'} className="muted">← Back</Link>
      <h1 className="page-title">{team?.name ?? 'Team'}</h1>
      <p className="muted">{team?.tributesRevealed ? 'Tributes are revealed' : 'Tributes stay sealed until reveal day'}</p>
      <div className="tabs">
        {(['members', 'memories', 'topics', 'search', 'yearbook', 'settings'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'members' && <MembersTab teamId={teamId} />}
      {tab === 'memories' && <MemoriesTab teamId={teamId} />}
      {tab === 'topics' && <TopicsTab teamId={teamId} />}
      {tab === 'search' && <SearchTab teamId={teamId} />}
      {tab === 'yearbook' && <YearbookTab teamId={teamId} />}
      {tab === 'settings' && <SettingsTab teamId={teamId} revealTributes={!!team?.revealTributes} brandColor={team?.brandColor ?? '#0F766E'} />}
    </Layout>
  )
}

function MembersTab({ teamId }: { teamId: string }) {
  const client = useClient()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (reset = false) => {
    if (loading) return
    setLoading(true)
    const after = reset ? null : cursor
    const result = await client.query(TEAM_MEMBERS, {
      teamId, first: 12, after, query: query || null,
    }).toPromise()
    const page = result.data?.teamMembers
    if (page) {
      setItems((prev) => reset ? page.items : [...prev, ...page.items])
      setCursor(page.nextCursor)
      setHasNext(page.hasNext)
    }
    setLoading(false)
  }, [client, teamId, cursor, query, loading])

  useEffect(() => {
    setItems([])
    setCursor(null)
    setHasNext(false)
    void load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, query])

  const sentinelRef = useInfiniteScroll(() => { if (hasNext) void load(false) }, hasNext && !loading)

  return (
    <section className="stack">
      <input placeholder="Search members…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="list">
        {items.map((m) => (
          <Link key={m.id} to={`/members/${m.id}`} className="list-item">
            <div>
              <strong>{m.nickname}</strong>
              <div className="muted">{m.bio || 'No bio yet'}</div>
            </div>
            <span className="chip">{m.role}</span>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} className="infinite-sentinel">{loading ? 'Loading…' : hasNext ? 'Scroll for more' : 'End of list'}</div>
    </section>
  )
}

function MemoriesTab({ teamId }: { teamId: string }) {
  const client = useClient()
  const [, createMemory] = useMutation(CREATE_MEMORY)
  const [items, setItems] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (reset = false) => {
    const result = await client.query(MEMORIES, {
      teamId, first: 10, after: reset ? null : cursor,
    }).toPromise()
    const page = result.data?.memories
    if (page) {
      setItems((prev) => reset ? page.items : [...prev, ...page.items])
      setCursor(page.nextCursor)
      setHasNext(page.hasNext)
    }
  }, [client, teamId, cursor])

  useEffect(() => { void load(true) }, [teamId])
  const sentinelRef = useInfiniteScroll(() => { if (hasNext) void load(false) }, hasNext)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const result = await createMemory({ teamId, title: title || null, bodyText, privateMemory: false, taggedIds: [] })
    if (result.error) {
      setError(result.error.message)
      return
    }
    setTitle('')
    setBodyText('')
    setCursor(null)
    await load(true)
  }

  return (
    <div className="grid-2">
      <section className="stack">
        {items.map((m) => (
          <article key={m.id} className="panel">
            <strong>{m.title || 'Untitled memory'}</strong>
            <p>{m.bodyText}</p>
            <div className="muted">— {m.writer.nickname}</div>
          </article>
        ))}
        <div ref={sentinelRef} className="infinite-sentinel">{hasNext ? 'Loading more…' : 'No more memories'}</div>
      </section>
      <form className="panel" onSubmit={onCreate}>
        <h2>Share a memory</h2>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Story<textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={5} required /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Post</button>
      </form>
    </div>
  )
}

function TopicsTab({ teamId }: { teamId: string }) {
  const [{ data }, reexecute] = useQuery({ query: TOPICS, variables: { teamId } })
  const [{ data: membersData }] = useQuery({ query: TEAM_MEMBERS, variables: { teamId, first: 50 } })
  const [, createTopic] = useMutation(CREATE_TOPIC)
  const [, voteTopic] = useMutation(VOTE_TOPIC)
  const [title, setTitle] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [nomineeId, setNomineeId] = useState('')
  const [{ data: standingsData }, reStandings] = useQuery({
    query: TOPIC_STANDINGS,
    variables: { topicId: selectedTopic },
    pause: !selectedTopic,
  })

  useEffect(() => {
    if (!selectedTopic && data?.topics?.[0]) {
      setSelectedTopic(data.topics[0].id)
    }
  }, [data, selectedTopic])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    await createTopic({ teamId, title })
    setTitle('')
    reexecute({ requestPolicy: 'network-only' })
  }

  async function onVote(e: FormEvent) {
    e.preventDefault()
    await voteTopic({ topicId: selectedTopic, nomineeId, repetitions: 1 })
    reStandings({ requestPolicy: 'network-only' })
  }

  return (
    <div className="grid-2">
      <section className="panel stack">
        <h2>Award topics</h2>
        <div className="list">
          {(data?.topics ?? []).map((t: any) => (
            <button key={t.id} className={selectedTopic === t.id ? 'active' : 'secondary'} onClick={() => setSelectedTopic(t.id)}>
              {t.title}
            </button>
          ))}
        </div>
        <form onSubmit={onCreate}>
          <label>New topic<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
          <button type="submit">Add topic</button>
        </form>
      </section>
      <section className="panel stack">
        <h2>Vote & standings</h2>
        <form onSubmit={onVote}>
          <label>
            Nominee
            <select value={nomineeId} onChange={(e) => setNomineeId(e.target.value)} required>
              <option value="">Select member</option>
              {(membersData?.teamMembers?.items ?? []).map((m: any) => (
                <option key={m.id} value={m.id}>{m.nickname}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={!selectedTopic}>Cast vote</button>
        </form>
        <div className="list">
          {(standingsData?.topicStandings ?? []).map((s: any) => (
            <div key={s.nominee.id} className="list-item">
              <strong>{s.nominee.nickname}</strong>
              <span className="chip">{s.score}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SearchTab({ teamId }: { teamId: string }) {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])
  const [{ data, fetching }] = useQuery({
    query: SEARCH,
    variables: { teamId, q: debounced, first: 20 },
    pause: debounced.trim().length < 2,
  })

  return (
    <section className="panel stack">
      <input placeholder="Search members, tributes, memories, topics…" value={q} onChange={(e) => setQ(e.target.value)} />
      {fetching && <p className="muted">Searching…</p>}
      <div className="list">
        {(data?.search?.items ?? []).map((hit: any) => (
          <div key={`${hit.type}-${hit.id}`} className="list-item">
            <div>
              <span className="chip">{hit.type}</span>
              <strong>{hit.title || 'Result'}</strong>
              <div className="muted">{hit.snippet}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function YearbookTab({ teamId }: { teamId: string }) {
  const [{ data }, reexecute] = useQuery({ query: YEARBOOK_EXPORTS, variables: { teamId } })
  const [, requestExport] = useMutation(REQUEST_EXPORT)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => reexecute({ requestPolicy: 'network-only' }), 5000)
    return () => clearInterval(id)
  }, [reexecute])

  async function onGenerate() {
    setError(null)
    const result = await requestExport({ teamId })
    if (result.error) setError(result.error.message)
    reexecute({ requestPolicy: 'network-only' })
  }

  return (
    <section className="panel stack">
      <h2>Yearbook PDF</h2>
      <p className="muted">Generate a printable yearbook from tributes, memories, awards, and characteristics.</p>
      <button onClick={onGenerate}>Generate yearbook</button>
      {error && <p className="error">{error}</p>}
      <div className="list">
        {(data?.yearbookExports ?? []).map((exp: any) => (
          <div key={exp.id} className="list-item">
            <div>
              <strong>{exp.status}</strong>
              <div className="muted">{new Date(exp.createdAt).toLocaleString()}</div>
              {exp.errorMessage && <div className="error">{exp.errorMessage}</div>}
            </div>
            {exp.status === 'READY' && (
              <button className="secondary" onClick={() => downloadYearbook(exp.id)}>Download</button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function SettingsTab({ teamId, revealTributes, brandColor }: { teamId: string; revealTributes: boolean; brandColor: string }) {
  const [, createInvite] = useMutation(CREATE_INVITE)
  const [, updateSettings] = useMutation(UPDATE_TEAM_SETTINGS)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [reveal, setReveal] = useState(revealTributes)
  const [color, setColor] = useState(brandColor)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setReveal(revealTributes)
    setColor(brandColor)
  }, [revealTributes, brandColor])

  async function onInvite() {
    const result = await createInvite({ teamId, role: 'MEMBER', maxUses: 50 })
    if (result.data?.createInvite?.code) {
      setInviteCode(result.data.createInvite.code)
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    const result = await updateSettings({ teamId, brandColor: color, revealTributes: reveal })
    setMessage(result.error ? result.error.message : 'Settings saved')
  }

  return (
    <div className="grid-2">
      <section className="panel stack">
        <h2>Invites</h2>
        <button onClick={onInvite}>Create invite code</button>
        {inviteCode && <p>Share code: <strong>{inviteCode}</strong></p>}
      </section>
      <form className="panel" onSubmit={onSave}>
        <h2>Team settings</h2>
        <label>Brand color<input value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} />
          Reveal tributes to recipients
        </label>
        {message && <p className="muted">{message}</p>}
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
