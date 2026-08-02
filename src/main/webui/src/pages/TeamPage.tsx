import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BookOpenText, DownloadSimple, MagnifyingGlass, Printer, Sparkle } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '../api/client'
import { downloadYearbook, uploadMedia } from '../api/http'
import type { Team, TeamMember, Tribute, Memory, Topic, TopicStanding, SearchHit, YearbookExport } from '../api/types'
import { useApiMutation, useApiQuery } from '../api/useApi'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Input, Label, Select, Textarea } from '../components/ui/Field'
import { InfiniteSentinel } from '../components/ui/InfiniteSentinel'
import { ListItem, ListItemLink } from '../components/ui/ListItem'
import { PageTitle } from '../components/ui/PageTitle'
import { Avatar } from '../components/ui/Avatar'
import { Tabs, TabButton } from '../components/ui/Tabs'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { MemoryComments } from '../components/MemoryComments'

const YEARBOOK_THEMES = ['CLASSIC', 'MODERN', 'SCRAPBOOK', 'MINIMAL'] as const
type YearbookThemeOption = (typeof YEARBOOK_THEMES)[number]

type Tab =
  | 'members'
  | 'tributes'
  | 'characteristics'
  | 'memories'
  | 'topics'
  | 'search'
  | 'yearbook'
  | 'preferences'
  | 'settings'

export default function TeamPage() {
  const { t } = useTranslation()
  const { teamId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'members'
  const setTab = (next: Tab) => setParams({ tab: next })

  const [{ data: team }, reTeam] = useApiQuery(!!teamId, () => api.team(teamId), [teamId])

  return (
    <Layout>
      <Link
        to={team ? `/orgs/${team.organizationId}` : '/app'}
        className="text-sm font-semibold text-muted hover:text-ink"
      >
        {t('team.back')}
      </Link>
      <PageTitle>{team?.name ?? t('team.fallbackTitle')}</PageTitle>
      <p className="text-muted">
        {team?.tributesRevealed ? t('team.tributesRevealed') : t('team.tributesSealed')}
      </p>
      <Tabs>
        {(
          [
            'members',
            'tributes',
            'characteristics',
            'memories',
            'topics',
            'search',
            'yearbook',
            'preferences',
            'settings',
          ] as Tab[]
        ).map((tabKey) => (
          <TabButton
            key={tabKey}
            active={tab === tabKey}
            data-tour={`tab-${tabKey}`}
            onClick={() => setTab(tabKey)}
          >
            {t(`team.tabs.${tabKey}`)}
          </TabButton>
        ))}
      </Tabs>
      {tab === 'members' && <MembersTab teamId={teamId} />}
      {tab === 'tributes' && <TributesTab teamId={teamId} />}
      {tab === 'characteristics' && <CharacteristicsTab teamId={teamId} />}
      {tab === 'memories' && <MemoriesTab teamId={teamId} />}
      {tab === 'topics' && <TopicsTab teamId={teamId} />}
      {tab === 'search' && <SearchTab teamId={teamId} />}
      {tab === 'yearbook' && <YearbookTab teamId={teamId} team={team} reTeam={reTeam} />}
      {tab === 'preferences' && <PreferencesTab teamId={teamId} />}
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
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<TeamMember[]>([])
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
      const after = reset ? undefined : cursorRef.current ?? undefined
      const page = await api.teamMembers(teamId, {
        first: 12,
        after,
        query: query || undefined,
      })
      setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
      setCursor(page.nextCursor ?? null)
      setHasNext(page.hasNext)
      loadingRef.current = false
      setLoading(false)
    },
    [teamId, query],
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
    <section className={stackClass}>
      <Label className="mb-0">
        <span className="sr-only">{t('team.searchMembers')}</span>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            className="ps-10"
            placeholder={t('team.searchMembers')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Label>
      <div className={stackClass}>
        {items.map((m) => (
          <ListItemLink key={m.id} to={`/members/${m.id}`}>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={m.nickname} src={m.avatar?.url} size="sm" />
              <div className="min-w-0">
                <strong>{m.nickname}</strong>
                <div className="text-sm text-muted">{m.bio || t('team.noBio')}</div>
                <div className="mt-1 text-xs font-semibold text-brand">{t('team.openProfile')}</div>
              </div>
            </div>
            <Chip>{m.role}</Chip>
          </ListItemLink>
        ))}
      </div>
      <InfiniteSentinel ref={sentinelRef}>
        {loading ? t('team.loading') : hasNext ? t('team.scrollMore') : t('team.endList')}
      </InfiniteSentinel>
    </section>
  )
}

function TributesTab({ teamId }: { teamId: string }) {
  const { t } = useTranslation()
  const [{ data: membersPage }] = useApiQuery(
    !!teamId,
    () => api.teamMembers(teamId, { first: 100 }),
    [teamId],
  )
  const [, createTribute] = useApiMutation(
    (
      id: string,
      body: {
        recipientId: string
        text: string
        anonymous: boolean
        privateTribute: boolean
      },
    ) => api.createTribute(id, body),
  )
  const [, hideTribute] = useApiMutation((tributeId: string) => api.hideTribute(tributeId))
  const [, reportTribute] = useApiMutation((tributeId: string, reason: string) =>
    api.reportTribute(tributeId, reason),
  )
  const [items, setItems] = useState<Tribute[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [text, setText] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [privateTribute, setPrivateTribute] = useState(false)
  const cursorRef = useRef<string | null>(null)
  const members = membersPage?.items ?? []

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  useEffect(() => {
    if (!recipientId && members[0]?.id) {
      setRecipientId(members[0].id)
    }
  }, [members, recipientId])

  const load = useCallback(
    async (reset = false) => {
      const page = await api.tributes(teamId, {
        first: 12,
        after: reset ? undefined : cursorRef.current ?? undefined,
      })
      setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
      setCursor(page.nextCursor ?? null)
      setHasNext(page.hasNext)
    },
    [teamId],
  )

  useEffect(() => {
    setItems([])
    setCursor(null)
    void load(true)
  }, [teamId, load])

  const sentinelRef = useInfiniteScroll(() => {
    if (hasNext) void load(false)
  }, hasNext)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!recipientId) return
    const result = await createTribute(teamId, {
      recipientId,
      text,
      anonymous,
      privateTribute,
    })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('team.tributeSaved'))
    setText('')
    setAnonymous(false)
    setPrivateTribute(false)
    setCursor(null)
    await load(true)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={stackClass}>
        <h2 className="font-display text-xl tracking-tight">{t('team.tributes')}</h2>
        {items.length === 0 && <p className="text-muted">{t('team.noTributes')}</p>}
        {items.map((tribute) => (
          <article key={tribute.id} className={panelClass}>
            <p className="whitespace-pre-wrap">{tribute.text}</p>
            {tribute.pictures?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tribute.pictures.map((pic) => (
                  <a key={pic.id} href={pic.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={pic.url}
                      alt=""
                      className="h-28 w-28 rounded-xl border border-line object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
              <span>
                {t('team.from')} {tribute.writer?.nickname}
              </span>
              <span>·</span>
              <span>
                {t('team.to')}{' '}
                <Link
                  to={`/members/${tribute.recipient?.id}`}
                  className="font-semibold text-brand hover:underline"
                >
                  {tribute.recipient?.nickname}
                </Link>
              </span>
              {tribute.anonymous && <Chip>{t('team.anonymous')}</Chip>}
              {tribute.privateTribute && <Chip>{t('team.privateTribute')}</Chip>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  reportTribute(tribute.id, 'Inappropriate').then((r) => {
                    if (r.error) toast.error(r.error.message)
                    else toast.success(t('team.tributeReported'))
                  })
                }
              >
                {t('team.report')}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  hideTribute(tribute.id).then((r) => {
                    if (r.error) toast.error(r.error.message)
                    else {
                      toast.success(t('team.tributeHidden'))
                      void load(true)
                    }
                  })
                }
              >
                {t('team.hide')}
              </Button>
            </div>
          </article>
        ))}
        <InfiniteSentinel ref={sentinelRef}>
          {hasNext ? t('team.moreTributes') : t('team.noMoreTributes')}
        </InfiniteSentinel>
      </section>

      <form className={cn(panelClass, stackClass)} onSubmit={onCreate}>
        <h2 className="font-display text-xl tracking-tight">{t('team.writeTribute')}</h2>
        <Label>
          {t('team.forMember')}
          <Select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
          >
            <option value="" disabled>
              {t('team.selectMember')}
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nickname}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          {t('team.tributeMessage')}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            required
          />
        </Label>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          {t('team.anonymous')}
        </label>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={privateTribute}
            onChange={(e) => setPrivateTribute(e.target.checked)}
          />
          {t('team.privateTribute')}
        </label>
        <Button type="submit">{t('team.saveTribute')}</Button>
      </form>
    </div>
  )
}

type CharItem = { id: string; title: string; count: number }
type MemberChars = {
  id: string
  nickname: string
  avatarUrl?: string | null
  characteristics: CharItem[]
}

function CharacteristicsTab({ teamId }: { teamId: string }) {
  const { t } = useTranslation()
  const [{ data: membersPage }] = useApiQuery(
    !!teamId,
    () => api.teamMembers(teamId, { first: 100 }),
    [teamId],
  )
  const [, addCharacteristic] = useApiMutation((teamMemberId: string, title: string) =>
    api.addCharacteristic(teamMemberId, title),
  )
  const [rows, setRows] = useState<MemberChars[]>([])
  const [loading, setLoading] = useState(false)
  const [memberId, setMemberId] = useState('')
  const [title, setTitle] = useState('')
  const members = membersPage?.items
  const memberList = members ?? []

  useEffect(() => {
    if (!memberId && memberList[0]?.id) {
      setMemberId(memberList[0].id)
    }
  }, [memberList, memberId])

  const load = useCallback(async () => {
    if (!members || members.length === 0) {
      setRows([])
      return
    }
    setLoading(true)
    const next: MemberChars[] = []
    for (const m of members) {
      const characteristics = await api.characteristics(m.id)
      next.push({
        id: m.id,
        nickname: m.nickname,
        avatarUrl: m.avatar?.url,
        characteristics,
      })
    }
    setRows(next)
    setLoading(false)
  }, [members])

  useEffect(() => {
    void load()
  }, [load])

  async function onAdd(e: FormEvent) {
    e.preventDefault()
    if (!memberId || !title.trim()) return
    const result = await addCharacteristic(memberId, title.trim())
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('team.characteristicAdded'))
    setTitle('')
    await load()
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={stackClass}>
        <h2 className="font-display text-xl tracking-tight">{t('team.characteristics')}</h2>
        {loading && <p className="text-muted">{t('team.loading')}</p>}
        {!loading && rows.length === 0 && (
          <p className="text-muted">{t('team.noCharacteristics')}</p>
        )}
        {rows.map((row) => (
          <article key={row.id} className={panelClass}>
            <div className="flex items-center gap-3">
              <Avatar name={row.nickname} src={row.avatarUrl ?? undefined} size="sm" />
              <div className="min-w-0">
                <Link
                  to={`/members/${row.id}`}
                  className="font-semibold text-ink hover:text-brand"
                >
                  {row.nickname}
                </Link>
              </div>
            </div>
            {row.characteristics.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t('team.noMemberCharacteristics')}</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {row.characteristics.map((c) => (
                  <Chip key={c.id}>
                    {c.title} × {c.count}
                  </Chip>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      <form className={cn(panelClass, stackClass)} onSubmit={onAdd}>
        <h2 className="font-display text-xl tracking-tight">{t('team.addCharacteristic')}</h2>
        <Label>
          {t('team.forMember')}
          <Select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
            <option value="" disabled>
              {t('team.selectMember')}
            </option>
            {memberList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nickname}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          {t('team.characteristicTag')}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('team.characteristicPlaceholder')}
            required
          />
        </Label>
        <Button type="submit">{t('team.add')}</Button>
      </form>
    </div>
  )
}

function MemoriesTab({ teamId }: { teamId: string }) {
  const { t } = useTranslation()
  const [, createMemory] = useApiMutation(
    (
      id: string,
      body: {
        title: string
        bodyText: string
        privateMemory: boolean
        taggedIds?: string[] | null
        mediaIds?: string[] | null
      },
    ) => api.createMemory(id, body),
  )
  const [items, setItems] = useState<Memory[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [posting, setPosting] = useState(false)
  const cursorRef = useRef<string | null>(null)

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  const load = useCallback(
    async (reset = false) => {
      const page = await api.memories(teamId, {
        first: 10,
        after: reset ? undefined : cursorRef.current ?? undefined,
      })
      setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
      setCursor(page.nextCursor ?? null)
      setHasNext(page.hasNext)
    },
    [teamId],
  )

  useEffect(() => {
    void load(true)
  }, [teamId, load])

  const sentinelRef = useInfiniteScroll(() => {
    if (hasNext) void load(false)
  }, hasNext)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setPosting(true)
    try {
      const mediaIds: string[] = []
      for (const file of files.slice(0, 6)) {
        const uploaded = await uploadMedia(file)
        mediaIds.push(uploaded.id)
      }
      const result = await createMemory(teamId, {
        title,
        bodyText,
        privateMemory: false,
        taggedIds: [],
        mediaIds,
      })
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(t('team.memoryPosted'))
      setTitle('')
      setBodyText('')
      setFiles([])
      setCursor(null)
      await load(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('team.memoryFailed'))
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={stackClass}>
        {items.map((m) => (
          <article key={m.id} className={panelClass}>
            <strong>{m.title || t('team.untitledMemory')}</strong>
            <p className="mt-2 whitespace-pre-wrap">{m.bodyText}</p>
            {m.pictures?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {m.pictures.map((pic) => (
                  <a key={pic.id} href={pic.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={pic.url}
                      alt=""
                      className="h-28 w-28 rounded-xl border border-line object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
            <div className="mt-2 text-sm text-muted">— {m.writer.nickname}</div>
            <MemoryComments memoryId={m.id} />
          </article>
        ))}
        <InfiniteSentinel ref={sentinelRef}>
          {hasNext ? t('team.moreMemories') : t('team.noMoreMemories')}
        </InfiniteSentinel>
      </section>
      <form className={cn(panelClass, stackClass)} onSubmit={onCreate}>
        <h2 className="font-display text-xl tracking-tight">{t('team.shareMemory')}</h2>
        <Label>
          {t('team.title')}
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Label>
        <Label>
          {t('team.story')}
          <Textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={5}
            required
          />
        </Label>
        <Label>
          {t('team.photos')}
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 6))}
          />
        </Label>
        {files.length > 0 && (
          <p className="text-sm text-muted">{t('team.photosSelected', { count: files.length })}</p>
        )}
        <Button type="submit" disabled={posting}>
          {posting ? t('team.posting') : t('team.post')}
        </Button>
      </form>
    </div>
  )
}

function TopicsTab({ teamId }: { teamId: string }) {
  const { t } = useTranslation()
  const [{ data: topics }, reexecute] = useApiQuery(!!teamId, () => api.topics(teamId), [teamId])
  const [{ data: membersPage }] = useApiQuery(
    !!teamId,
    () => api.teamMembers(teamId, { first: 50 }),
    [teamId],
  )
  const [, createTopic] = useApiMutation((id: string, topicTitle: string) =>
    api.createTopic(id, topicTitle),
  )
  const [, voteTopic] = useApiMutation(
    (topicId: string, nomineeId: string, repetitions: number) =>
      api.voteTopic(topicId, nomineeId, repetitions),
  )
  const [title, setTitle] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [nomineeId, setNomineeId] = useState('')
  const [{ data: standings }, reStandings] = useApiQuery(
    !!selectedTopic,
    () => api.topicStandings(selectedTopic),
    [selectedTopic],
  )

  useEffect(() => {
    if (!selectedTopic && topics?.[0]) {
      setSelectedTopic(topics[0].id)
    }
  }, [topics, selectedTopic])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    const result = await createTopic(teamId, title)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('team.topicAdded'))
    setTitle('')
    reexecute()
  }

  async function onVote(e: FormEvent) {
    e.preventDefault()
    const result = await voteTopic(selectedTopic, nomineeId, 1)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('team.voteCast'))
    reStandings()
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={cn(panelClass, stackClass)}>
        <h2 className="font-display text-xl tracking-tight">{t('team.awardTopics')}</h2>
        <div className={stackClass}>
          {(topics ?? []).map((topic: Topic) => (
            <Button
              key={topic.id}
              variant={selectedTopic === topic.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedTopic(topic.id)}
            >
              {topic.title}
            </Button>
          ))}
        </div>
        <form className={stackClass} onSubmit={onCreate}>
          <Label>
            {t('team.newTopic')}
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Label>
          <Button type="submit">{t('team.addTopic')}</Button>
        </form>
      </section>
      <section className={cn(panelClass, stackClass)}>
        <h2 className="font-display text-xl tracking-tight">{t('team.voteStandings')}</h2>
        <form className={stackClass} onSubmit={onVote}>
          <Label>
            {t('team.nominee')}
            <Select value={nomineeId} onChange={(e) => setNomineeId(e.target.value)} required>
              <option value="">{t('team.selectMember')}</option>
              {(membersPage?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nickname}
                </option>
              ))}
            </Select>
          </Label>
          <Button type="submit" disabled={!selectedTopic}>
            {t('team.castVote')}
          </Button>
        </form>
        <div className={stackClass}>
          {(standings ?? []).map((s: TopicStanding) => (
            <ListItem key={s.nominee.id}>
              <strong>{s.nominee.nickname}</strong>
              <Chip>{s.score}</Chip>
            </ListItem>
          ))}
        </div>
      </section>
    </div>
  )
}

function SearchTab({ teamId }: { teamId: string }) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(q), 250)
    return () => clearTimeout(timer)
  }, [q])
  const [{ data, fetching }] = useApiQuery(
    debounced.trim().length >= 2,
    () => api.search(teamId, debounced, { first: 20 }),
    [teamId, debounced],
  )

  return (
    <section className={cn(panelClass, stackClass)}>
      <Label className="mb-0">
        <span className="sr-only">{t('team.tabs.search')}</span>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            className="ps-10"
            placeholder={t('team.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Label>
      {fetching && <p className="text-muted">{t('team.searching')}</p>}
      <div className={stackClass}>
        {(data?.items ?? []).map((hit: SearchHit) => (
          <ListItem key={`${hit.type}-${hit.id}`}>
            <div>
              <Chip>{hit.type}</Chip>
              <strong className="ms-2">{hit.title || t('team.result')}</strong>
              <div className="text-sm text-muted">{hit.snippet}</div>
            </div>
          </ListItem>
        ))}
      </div>
    </section>
  )
}

function YearbookTab({
  teamId,
  team,
  reTeam,
}: {
  teamId: string
  team?: Team
  reTeam: (opts?: { requestPolicy?: string }) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [{ data: exports }, reexecute] = useApiQuery(
    !!teamId,
    () => api.yearbookExports(teamId),
    [teamId],
  )
  const [, requestExport] = useApiMutation((id: string) => api.requestYearbookExport(id))
  const [, updateYearbook] = useApiMutation(
    (
      id: string,
      body: {
        title?: string | null
        subtitle?: string | null
        dedication?: string | null
        theme?: string | null
        showMembers?: boolean | null
        showTributes?: boolean | null
        showCharacteristics?: boolean | null
        showMemories?: boolean | null
        showAwards?: boolean | null
      },
    ) => api.updateYearbookSettings(id, body),
  )

  const [title, setTitle] = useState(team?.yearbookTitle ?? '')
  const [subtitle, setSubtitle] = useState(team?.yearbookSubtitle ?? '')
  const [dedication, setDedication] = useState(team?.yearbookDedication ?? '')
  const [theme, setTheme] = useState<YearbookThemeOption>(
    (team?.yearbookTheme as YearbookThemeOption | undefined) ?? 'CLASSIC',
  )
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
    setTheme((team?.yearbookTheme as YearbookThemeOption | undefined) ?? 'CLASSIC')
    setShowMembers(team?.yearbookShowMembers ?? true)
    setShowTributes(team?.yearbookShowTributes ?? true)
    setShowCharacteristics(team?.yearbookShowCharacteristics ?? true)
    setShowMemories(team?.yearbookShowMemories ?? true)
    setShowAwards(team?.yearbookShowAwards ?? true)
  }, [team])

  useEffect(() => {
    const id = setInterval(() => reexecute(), 5000)
    return () => clearInterval(id)
  }, [reexecute])

  async function onGenerate() {
    const result = await requestExport(teamId)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('team.generationStarted'))
    reexecute()
  }

  async function saveCustomization(showToast = true) {
    const result = await updateYearbook(teamId, {
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
    // Refresh team + assembled yearbook so the print page never shows a stale theme.
    reTeam()
    await api.yearbook(teamId)
    if (showToast) toast.success(t('team.designSaved'))
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
      void navigate(`/teams/${teamId}/yearbook`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={cn(panelClass, stackClass)}>
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
          <BookOpenText size={22} weight="duotone" className="text-brand" />
          {t('team.viewPrint')}
        </h2>
        <p className="text-muted">{t('team.viewPrintHint')}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openYearbookPreview} disabled={saving}>
            <BookOpenText size={18} />
            {t('team.openYearbook')}
          </Button>
          <Button variant="secondary" onClick={openYearbookPreview} disabled={saving}>
            <Printer size={18} />
            {t('team.printReady')}
          </Button>
        </div>
      </section>

      <section className={cn(panelClass, stackClass)}>
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
          <Sparkle size={22} weight="duotone" className="text-accent" />
          {t('team.serverPdf')}
        </h2>
        <p className="text-muted">{t('team.serverPdfHint')}</p>
        <Button onClick={onGenerate}>{t('team.generatePdf')}</Button>
        <div className={stackClass}>
          {(exports ?? []).map((exp: YearbookExport) => (
            <ListItem key={exp.id}>
              <div>
                <strong>{exp.status}</strong>
                <div className="text-sm text-muted">
                  {new Date(exp.createdAt).toLocaleString()}
                </div>
                {exp.errorMessage && <div className="text-danger">{exp.errorMessage}</div>}
              </div>
              {exp.status === 'READY' && (
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => downloadYearbook(exp.id)}
                >
                  <DownloadSimple size={18} />
                  {t('team.download')}
                </Button>
              )}
            </ListItem>
          ))}
        </div>
      </section>

      <form className={cn(panelClass, stackClass, 'lg:col-span-2')} onSubmit={onSaveCustomization}>
        <h2 className="font-display text-xl tracking-tight">{t('team.customize')}</h2>
        <p className="text-muted">{t('team.customizeHint')}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Label>
            {t('team.coverTitle')}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('team.titlePlaceholder')}
            />
          </Label>
          <Label>
            {t('team.coverSubtitle')}
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={t('team.subtitlePlaceholder')}
            />
          </Label>
        </div>
        <Label>
          {t('team.dedicationLabel')}
          <Textarea
            value={dedication}
            onChange={(e) => setDedication(e.target.value)}
            rows={3}
            placeholder={t('team.dedicationPlaceholder')}
          />
        </Label>
        <Label>
          {t('team.layoutTheme')}
          <Select
            value={theme}
            onChange={(e) => setTheme(e.target.value as YearbookThemeOption)}
          >
            {YEARBOOK_THEMES.map((themeOption) => (
              <option key={themeOption} value={themeOption}>
                {themeOption.charAt(0) + themeOption.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </Label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Toggle label={t('team.showMembers')} checked={showMembers} onChange={setShowMembers} />
          <Toggle label={t('team.showTributes')} checked={showTributes} onChange={setShowTributes} />
          <Toggle
            label={t('team.showCharacteristics')}
            checked={showCharacteristics}
            onChange={setShowCharacteristics}
          />
          <Toggle label={t('team.showMemories')} checked={showMemories} onChange={setShowMemories} />
          <Toggle label={t('team.showAwards')} checked={showAwards} onChange={setShowAwards} />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('team.saveDesign')}
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

function PreferencesTab({ teamId }: { teamId: string }) {
  const { t } = useTranslation()
  const [{ data: membership, fetching, error }, reexecute] = useApiQuery(
    !!teamId,
    () => api.myTeamMembership(teamId),
    [teamId],
  )
  const [, upsertProfile] = useApiMutation(
    (
      id: string,
      body: { nickname?: string | null; bio?: string | null; avatarId?: string | null },
    ) => api.upsertTeamMemberProfile(id, body),
  )
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!membership) return
    setNickname(membership.nickname ?? '')
    setBio(membership.bio ?? '')
  }, [membership])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await upsertProfile(teamId, {
        nickname,
        bio,
        avatarId: null,
      })
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(t('team.profileUpdated'))
      reexecute()
    } finally {
      setSaving(false)
    }
  }

  async function onAvatar(file: File | null) {
    if (!file) return
    try {
      const uploaded = await uploadMedia(file)
      const result = await upsertProfile(teamId, {
        nickname: null,
        bio: null,
        avatarId: uploaded.id,
      })
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(t('team.photoUpdated'))
      reexecute()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('team.uploadFailed'))
    }
  }

  if (fetching && !membership) {
    return <p className="text-muted">{t('team.loadingProfile')}</p>
  }
  if (error) {
    return <p className="text-danger">{error.message}</p>
  }

  return (
    <form className={cn(panelClass, stackClass, 'max-w-lg')} onSubmit={onSave}>
      <h2 className="font-display text-xl tracking-tight">{t('team.yourProfile')}</h2>
      <p className="text-muted">
        {t('team.profileHintBefore')}{' '}
        <Link to="/preferences" className="font-semibold text-brand hover:underline">
          {t('nav.preferences')}
        </Link>
        {t('team.profileHintAfter')}
      </p>
      <Avatar name={membership?.nickname ?? 'M'} src={membership?.avatar?.url} size="lg" />
      <Label>
        {t('team.displayNickname')}
        <Input value={nickname} onChange={(e) => setNickname(e.target.value)} required />
      </Label>
      <Label>
        {t('team.bio')}
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
      </Label>
      <Label>
        {t('team.profilePhoto')}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
        />
      </Label>
      <Button type="submit" disabled={saving}>
        {saving ? t('common.saving') : t('team.saveProfile')}
      </Button>
    </form>
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
  const { t } = useTranslation()
  const [, createInvite] = useApiMutation(
    (id: string, body: { role?: string | null; maxUses?: number | null }) =>
      api.createInvite(id, body),
  )
  const [, inviteByEmail] = useApiMutation(
    (id: string, email: string, role: string) => api.inviteByEmail(id, email, role),
  )
  const [, updateSettings] = useApiMutation(
    (id: string, body: { brandColor?: string | null; revealTributes?: boolean | null }) =>
      api.updateTeamSettings(id, body),
  )
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [reveal, setReveal] = useState(revealTributes)
  const [color, setColor] = useState(brandColor)

  useEffect(() => {
    setReveal(revealTributes)
    setColor(brandColor)
  }, [revealTributes, brandColor])

  async function onInvite() {
    const result = await createInvite(teamId, { role: 'MEMBER', maxUses: 50 })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    if (result.data?.code) {
      setInviteCode(result.data.code)
      toast.success(t('team.inviteCreated'))
    }
  }

  async function onInviteEmail(e: FormEvent) {
    e.preventDefault()
    setSendingEmail(true)
    try {
      const result = await inviteByEmail(teamId, inviteEmail.trim(), 'MEMBER')
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(t('team.inviteSent', { email: inviteEmail.trim() }))
      setInviteEmail('')
      if (result.data?.code) {
        setInviteCode(result.data.code)
      }
    } finally {
      setSendingEmail(false)
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    const result = await updateSettings(teamId, { brandColor: color, revealTributes: reveal })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success(t('team.settingsSaved'))
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={cn(panelClass, stackClass)}>
        <h2 className="font-display text-xl tracking-tight">{t('team.invites')}</h2>
        <p className="text-sm text-muted">{t('team.invitesHint')}</p>
        <Button onClick={onInvite}>{t('team.createInvite')}</Button>
        {inviteCode && (
          <p>
            {t('team.latestCode')} <strong>{inviteCode}</strong>
            <br />
            <span className="text-sm text-muted">
              {t('team.joinLink')} /join?code={inviteCode}
            </span>
          </p>
        )}
        <form className={stackClass} onSubmit={onInviteEmail}>
          <Label>
            {t('team.inviteByEmail')}
            <Input
              type="email"
              required
              placeholder={t('team.inviteEmailPlaceholder')}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </Label>
          <Button type="submit" disabled={sendingEmail}>
            {sendingEmail ? t('team.sending') : t('team.sendInvite')}
          </Button>
        </form>
      </section>
      <form className={cn(panelClass, stackClass)} onSubmit={onSave}>
        <h2 className="font-display text-xl tracking-tight">{t('team.teamSettings')}</h2>
        <Label>
          {t('team.brandColor')}
          <Input value={color} onChange={(e) => setColor(e.target.value)} />
        </Label>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={reveal}
            onChange={(e) => setReveal(e.target.checked)}
          />
          {t('team.revealTributes')}
        </label>
        <Button type="submit">{t('team.save')}</Button>
      </form>
    </div>
  )
}
