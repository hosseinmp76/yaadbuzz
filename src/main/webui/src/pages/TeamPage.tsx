import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BookOpenText, DownloadSimple, MagnifyingGlass, Printer, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useClient, useMutation, useQuery } from 'urql'
import Layout from '../components/Layout'
import { ThemePicker } from '../components/ThemePicker'
import { Button } from '../components/ui/Button'
import { Input, Label, Select, Textarea } from '../components/ui/Field'
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
  UPDATE_YEARBOOK_SETTINGS,
  VOTE_TOPIC,
  YEARBOOK,
  YEARBOOK_EXPORTS,
} from '../api/queries'

const YEARBOOK_THEMES = ['CLASSIC', 'MODERN', 'SCRAPBOOK', 'MINIMAL'] as const
type YearbookThemeOption = (typeof YEARBOOK_THEMES)[number]

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
      <Link
        to={team ? `/orgs/${team.organizationId}` : '/app'}
        className="text-sm font-semibold text-muted hover:text-ink"
      >
        ← Back
      </Link>
      <h1 className="page-title">{team?.name ?? 'Team'}</h1>
      <p className="text-muted">
        {team?.tributesRevealed
          ? 'Tributes are revealed'
          : 'Tributes stay sealed until reveal day'}
      </p>
      <div className="tabs">
        {(['members', 'memories', 'topics', 'search', 'yearbook', 'settings'] as Tab[]).map(
          (t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ),
        )}
      </div>
      {tab === 'members' && <MembersTab teamId={teamId} />}
      {tab === 'memories' && <MemoriesTab teamId={teamId} />}
      {tab === 'topics' && <TopicsTab teamId={teamId} />}
      {tab === 'search' && <SearchTab teamId={teamId} />}
      {tab === 'yearbook' && <YearbookTab teamId={teamId} team={team} />}
      {tab === 'settings' && (
        <SettingsTab
          teamId={teamId}
          revealTributes={!!team?.revealTributes}
          brandColor={team?.brandColor ?? '#0F766E'}
        />
      )}
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
  const loadingRef = useRef(false)
  const cursorRef = useRef<string | null>(null)

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  const load = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setLoading(true)
      const after = reset ? null : cursorRef.current
      const result = await client
        .query(TEAM_MEMBERS, {
          teamId,
          first: 12,
          after,
          query: query || null,
        })
        .toPromise()
      const page = result.data?.teamMembers
      if (page) {
        setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
        setCursor(page.nextCursor)
        setHasNext(page.hasNext)
      }
      loadingRef.current = false
      setLoading(false)
    },
    [client, teamId, query],
  )

  useEffect(() => {
    setItems([])
    setCursor(null)
    setHasNext(false)
    void load(true)
  }, [teamId, query, load])

  const sentinelRef = useInfiniteScroll(() => {
    if (hasNext) void load(false)
  }, hasNext && !loading)

  return (
    <section className="stack">
      <Label className="mb-0">
        <span className="sr-only">Search members</span>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            className="pl-10"
            placeholder="Search members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Label>
      <div className="stack">
        {items.map((m) => (
          <Link key={m.id} to={`/members/${m.id}`} className="list-item">
            <div>
              <strong>{m.nickname}</strong>
              <div className="text-sm text-muted">{m.bio || 'No bio yet'}</div>
            </div>
            <span className="chip">{m.role}</span>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} className="infinite-sentinel">
        {loading ? 'Loading…' : hasNext ? 'Scroll for more' : 'End of list'}
      </div>
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
  const cursorRef = useRef<string | null>(null)

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  const load = useCallback(
    async (reset = false) => {
      const result = await client
        .query(MEMORIES, {
          teamId,
          first: 10,
          after: reset ? null : cursorRef.current,
        })
        .toPromise()
      const page = result.data?.memories
      if (page) {
        setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
        setCursor(page.nextCursor)
        setHasNext(page.hasNext)
      }
    },
    [client, teamId],
  )

  useEffect(() => {
    void load(true)
  }, [teamId, load])

  const sentinelRef = useInfiniteScroll(() => {
    if (hasNext) void load(false)
  }, hasNext)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    const result = await createMemory({
      teamId,
      title: title || null,
      bodyText,
      privateMemory: false,
      taggedIds: [],
    })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Memory posted')
    setTitle('')
    setBodyText('')
    setCursor(null)
    await load(true)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="stack">
        {items.map((m) => (
          <article key={m.id} className="panel">
            <strong>{m.title || 'Untitled memory'}</strong>
            <p className="mt-2 whitespace-pre-wrap">{m.bodyText}</p>
            <div className="mt-2 text-sm text-muted">— {m.writer.nickname}</div>
          </article>
        ))}
        <div ref={sentinelRef} className="infinite-sentinel">
          {hasNext ? 'Loading more…' : 'No more memories'}
        </div>
      </section>
      <form className="panel stack" onSubmit={onCreate}>
        <h2 className="font-display text-xl tracking-tight">Share a memory</h2>
        <Label>
          Title
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Label>
        <Label>
          Story
          <Textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={5}
            required
          />
        </Label>
        <Button type="submit">Post</Button>
      </form>
    </div>
  )
}

function TopicsTab({ teamId }: { teamId: string }) {
  const [{ data }, reexecute] = useQuery({ query: TOPICS, variables: { teamId } })
  const [{ data: membersData }] = useQuery({
    query: TEAM_MEMBERS,
    variables: { teamId, first: 50 },
  })
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
    const result = await createTopic({ teamId, title })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Topic added')
    setTitle('')
    reexecute({ requestPolicy: 'network-only' })
  }

  async function onVote(e: FormEvent) {
    e.preventDefault()
    const result = await voteTopic({ topicId: selectedTopic, nomineeId, repetitions: 1 })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Vote cast')
    reStandings({ requestPolicy: 'network-only' })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="panel stack">
        <h2 className="font-display text-xl tracking-tight">Award topics</h2>
        <div className="stack">
          {(data?.topics ?? []).map((t: { id: string; title: string }) => (
            <Button
              key={t.id}
              variant={selectedTopic === t.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedTopic(t.id)}
            >
              {t.title}
            </Button>
          ))}
        </div>
        <form className="stack" onSubmit={onCreate}>
          <Label>
            New topic
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Label>
          <Button type="submit">Add topic</Button>
        </form>
      </section>
      <section className="panel stack">
        <h2 className="font-display text-xl tracking-tight">Vote & standings</h2>
        <form className="stack" onSubmit={onVote}>
          <Label>
            Nominee
            <Select value={nomineeId} onChange={(e) => setNomineeId(e.target.value)} required>
              <option value="">Select member</option>
              {(membersData?.teamMembers?.items ?? []).map(
                (m: { id: string; nickname: string }) => (
                  <option key={m.id} value={m.id}>
                    {m.nickname}
                  </option>
                ),
              )}
            </Select>
          </Label>
          <Button type="submit" disabled={!selectedTopic}>
            Cast vote
          </Button>
        </form>
        <div className="stack">
          {(standingsData?.topicStandings ?? []).map(
            (s: { nominee: { id: string; nickname: string }; score: number }) => (
              <div key={s.nominee.id} className="list-item">
                <strong>{s.nominee.nickname}</strong>
                <span className="chip">{s.score}</span>
              </div>
            ),
          )}
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
      <Label className="mb-0">
        <span className="sr-only">Search</span>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            className="pl-10"
            placeholder="Search members, tributes, memories, topics…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Label>
      {fetching && <p className="text-muted">Searching…</p>}
      <div className="stack">
        {(data?.search?.items ?? []).map(
          (hit: { type: string; id: string; title?: string; snippet?: string }) => (
            <div key={`${hit.type}-${hit.id}`} className="list-item">
              <div>
                <span className="chip">{hit.type}</span>
                <strong className="ml-2">{hit.title || 'Result'}</strong>
                <div className="text-sm text-muted">{hit.snippet}</div>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  )
}

function YearbookTab({
  teamId,
  team,
}: {
  teamId: string
  team?: {
    yearbookTitle?: string
    yearbookSubtitle?: string
    yearbookDedication?: string
    yearbookTheme?: YearbookThemeOption
    yearbookShowMembers?: boolean
    yearbookShowTributes?: boolean
    yearbookShowCharacteristics?: boolean
    yearbookShowMemories?: boolean
    yearbookShowAwards?: boolean
  }
}) {
  const navigate = useNavigate()
  const client = useClient()
  const [{ data }, reexecute] = useQuery({ query: YEARBOOK_EXPORTS, variables: { teamId } })
  const [, requestExport] = useMutation(REQUEST_EXPORT)
  const [, updateYearbook] = useMutation(UPDATE_YEARBOOK_SETTINGS)
  const [, reTeam] = useQuery({ query: TEAM, variables: { id: teamId } })

  const [title, setTitle] = useState(team?.yearbookTitle ?? '')
  const [subtitle, setSubtitle] = useState(team?.yearbookSubtitle ?? '')
  const [dedication, setDedication] = useState(team?.yearbookDedication ?? '')
  const [theme, setTheme] = useState<YearbookThemeOption>(team?.yearbookTheme ?? 'CLASSIC')
  const [showMembers, setShowMembers] = useState(team?.yearbookShowMembers ?? true)
  const [showTributes, setShowTributes] = useState(team?.yearbookShowTributes ?? true)
  const [showCharacteristics, setShowCharacteristics] = useState(
    team?.yearbookShowCharacteristics ?? true,
  )
  const [showMemories, setShowMemories] = useState(team?.yearbookShowMemories ?? true)
  const [showAwards, setShowAwards] = useState(team?.yearbookShowAwards ?? true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(team?.yearbookTitle ?? '')
    setSubtitle(team?.yearbookSubtitle ?? '')
    setDedication(team?.yearbookDedication ?? '')
    setTheme(team?.yearbookTheme ?? 'CLASSIC')
    setShowMembers(team?.yearbookShowMembers ?? true)
    setShowTributes(team?.yearbookShowTributes ?? true)
    setShowCharacteristics(team?.yearbookShowCharacteristics ?? true)
    setShowMemories(team?.yearbookShowMemories ?? true)
    setShowAwards(team?.yearbookShowAwards ?? true)
  }, [team])

  useEffect(() => {
    const id = setInterval(() => reexecute({ requestPolicy: 'network-only' }), 5000)
    return () => clearInterval(id)
  }, [reexecute])

  async function onGenerate() {
    const result = await requestExport({ teamId })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Yearbook generation started')
    reexecute({ requestPolicy: 'network-only' })
  }

  async function saveCustomization(showToast = true) {
    const result = await updateYearbook({
      teamId,
      title,
      subtitle,
      dedication,
      theme,
      showMembers,
      showTributes,
      showCharacteristics,
      showMemories,
      showAwards,
    })
    if (result.error) {
      toast.error(result.error.message)
      return false
    }
    // Refresh cached team + assembled yearbook so the print page never shows a stale theme.
    reTeam({ requestPolicy: 'network-only' })
    await client
      .query(YEARBOOK, { teamId }, { requestPolicy: 'network-only' })
      .toPromise()
    if (showToast) toast.success('Yearbook customization saved')
    return true
  }

  async function onSaveCustomization(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await saveCustomization(true)
    } finally {
      setSaving(false)
    }
  }

  async function openYearbookPreview() {
    setSaving(true)
    try {
      const ok = await saveCustomization(false)
      if (!ok) return
      navigate(`/teams/${teamId}/yearbook`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel stack">
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
          <BookOpenText size={22} weight="duotone" className="text-brand" />
          View & print online
        </h2>
        <p className="text-muted">
          Open the live yearbook in your browser, then use Print → Save as PDF. Current form
          values are saved before opening.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openYearbookPreview} disabled={saving}>
            <BookOpenText size={18} />
            Open yearbook
          </Button>
          <Button variant="secondary" onClick={openYearbookPreview} disabled={saving}>
            <Printer size={18} />
            Print-ready page
          </Button>
        </div>
      </section>

      <section className="panel stack">
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
          <Sparkle size={22} weight="duotone" className="text-accent" />
          Server PDF export
        </h2>
        <p className="text-muted">
          Generate a downloadable PDF on the server (uses the same customization).
        </p>
        <Button onClick={onGenerate}>Generate yearbook PDF</Button>
        <div className="stack">
          {(data?.yearbookExports ?? []).map(
            (exp: {
              id: string
              status: string
              createdAt: string
              errorMessage?: string
            }) => (
              <div key={exp.id} className="list-item">
                <div>
                  <strong>{exp.status}</strong>
                  <div className="text-sm text-muted">
                    {new Date(exp.createdAt).toLocaleString()}
                  </div>
                  {exp.errorMessage && <div className="text-danger">{exp.errorMessage}</div>}
                </div>
                {exp.status === 'READY' && (
                  <Button variant="secondary" onClick={() => downloadYearbook(exp.id)}>
                    <DownloadSimple size={18} />
                    Download
                  </Button>
                )}
              </div>
            ),
          )}
        </div>
      </section>

      <form className="panel stack lg:col-span-2" onSubmit={onSaveCustomization}>
        <h2 className="font-display text-xl tracking-tight">Customize yearbook</h2>
        <p className="text-muted">
          Team admins can change cover copy, theme, and which sections appear online and in PDFs.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Label>
            Cover title
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Defaults to team name + Yearbook"
            />
          </Label>
          <Label>
            Cover subtitle
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Defaults to organization name"
            />
          </Label>
        </div>
        <Label>
          Dedication / cover message
          <Textarea
            value={dedication}
            onChange={(e) => setDedication(e.target.value)}
            rows={3}
            placeholder="Optional message on the cover"
          />
        </Label>
        <Label>
          Theme
          <Select
            value={theme}
            onChange={(e) => setTheme(e.target.value as YearbookThemeOption)}
          >
            {YEARBOOK_THEMES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </Label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Toggle label="Show members" checked={showMembers} onChange={setShowMembers} />
          <Toggle label="Show tributes" checked={showTributes} onChange={setShowTributes} />
          <Toggle
            label="Show characteristics"
            checked={showCharacteristics}
            onChange={setShowCharacteristics}
          />
          <Toggle label="Show memories" checked={showMemories} onChange={setShowMemories} />
          <Toggle label="Show awards" checked={showAwards} onChange={setShowAwards} />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save yearbook design'}
        </Button>
      </form>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 font-semibold">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function SettingsTab({
  teamId,
  revealTributes,
  brandColor,
}: {
  teamId: string
  revealTributes: boolean
  brandColor: string
}) {
  const [, createInvite] = useMutation(CREATE_INVITE)
  const [, updateSettings] = useMutation(UPDATE_TEAM_SETTINGS)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [reveal, setReveal] = useState(revealTributes)
  const [color, setColor] = useState(brandColor)

  useEffect(() => {
    setReveal(revealTributes)
    setColor(brandColor)
  }, [revealTributes, brandColor])

  async function onInvite() {
    const result = await createInvite({ teamId, role: 'MEMBER', maxUses: 50 })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    if (result.data?.createInvite?.code) {
      setInviteCode(result.data.createInvite.code)
      toast.success('Invite code created')
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    const result = await updateSettings({ teamId, brandColor: color, revealTributes: reveal })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Settings saved')
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="panel stack">
        <h2 className="font-display text-xl tracking-tight">Invites</h2>
        <Button onClick={onInvite}>Create invite code</Button>
        {inviteCode && (
          <p>
            Share code: <strong>{inviteCode}</strong>
          </p>
        )}
      </section>
      <form className="panel stack" onSubmit={onSave}>
        <h2 className="font-display text-xl tracking-tight">Team settings</h2>
        <Label>
          Brand color
          <Input value={color} onChange={(e) => setColor(e.target.value)} />
        </Label>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={reveal}
            onChange={(e) => setReveal(e.target.checked)}
          />
          Reveal tributes to recipients
        </label>
        <Button type="submit">Save</Button>
      </form>
      <section className="panel md:col-span-2">
        <ThemePicker />
      </section>
    </div>
  )
}
