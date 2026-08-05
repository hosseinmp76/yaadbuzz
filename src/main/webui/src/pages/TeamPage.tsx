import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  BookOpenText,
  Camera,
  ChatCircleText,
  GearSix,
  MagnifyingGlass,
  Printer,
  ShieldCheck,
  Tag,
  Trophy,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '../api/client'
import type { Team, TeamMember, Tribute, Memory, Topic, TopicStanding, SearchHit } from '../api/types'
import { useApiMutation, useApiQuery } from '../api/useApi'
import Layout from '../components/Layout'
import {
  AppSidebarChrome,
  SidebarNavButton,
  sidebarNavClass,
} from '../components/AppSidebar'
import { TeamEncryptionUnlock } from '../components/TeamEncryptionUnlock'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Input, Label, Select, Textarea } from '../components/ui/Field'
import { ColorPicker, normalizeHexColor } from '../components/ui/ColorPicker'
import { InfiniteSentinel } from '../components/ui/InfiniteSentinel'
import { ListItem } from '../components/ui/ListItem'
import { PageTitle } from '../components/ui/PageTitle'
import { Avatar } from '../components/ui/Avatar'
import { EncryptedImage } from '../crypto/EncryptedImage'
import {
  decryptMemories,
  decryptTributes,
  prepareMemoryPayload,
  prepareTributePayload,
} from '../crypto/contentCrypto'
import { uploadTeamMedia } from '../crypto/uploadEncryptedMedia'
import { useTeamCrypto } from '../crypto/useTeamCrypto'
import { isWrongTeamKeyError } from '../crypto/verifyTeamKey'
import { cn } from '../lib/cn'
import { panelClass, stackClass, backLinkClass, sectionTitleClass, tributeCardClass } from '../components/ui/styles'
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
  | 'personalSettings'
  | 'adminSettings'

const TEAM_TABS: { id: Tab; icon: Icon; adminOnly?: boolean }[] = [
  { id: 'members', icon: UsersThree },
  { id: 'tributes', icon: ChatCircleText },
  { id: 'characteristics', icon: Tag },
  { id: 'memories', icon: Camera },
  { id: 'topics', icon: Trophy },
  { id: 'search', icon: MagnifyingGlass },
  { id: 'yearbook', icon: BookOpenText },
  { id: 'personalSettings', icon: GearSix },
  { id: 'adminSettings', icon: ShieldCheck, adminOnly: true },
]

function normalizeTab(raw: string | null): Tab {
  if (raw === 'preferences' || raw === 'settings') return 'personalSettings'
  if (
    raw === 'members' ||
    raw === 'tributes' ||
    raw === 'characteristics' ||
    raw === 'memories' ||
    raw === 'topics' ||
    raw === 'search' ||
    raw === 'yearbook' ||
    raw === 'personalSettings' ||
    raw === 'adminSettings'
  ) {
    return raw
  }
  return 'members'
}

export default function TeamPage() {
  const { t } = useTranslation()
  const { teamId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = normalizeTab(params.get('tab'))
  const setTab = (next: Tab) => setParams({ tab: next })

  const [{ data: team }, reTeam] = useApiQuery(!!teamId, () => api.team(teamId), [teamId])
  const [{ data: membership }] = useApiQuery(
    !!teamId,
    () => api.myTeamMembership(teamId),
    [teamId],
  )
  const isAdmin = membership?.role === 'ADMIN'
  const teamCrypto = useTeamCrypto(teamId, team?.encryptionEnabled)
  const cryptoKey = teamCrypto.key

  useEffect(() => {
    if (tab === 'adminSettings' && membership && !isAdmin) {
      setParams({ tab: 'personalSettings' })
    }
  }, [tab, membership, isAdmin, setParams])

  const visibleTabs = TEAM_TABS.filter((item) => !item.adminOnly || isAdmin)

  const tabButtons = (stacked: boolean) => (
    <nav
      aria-label={team?.name ?? t('team.fallbackTitle')}
      className={sidebarNavClass(stacked)}
    >
      {visibleTabs.map(({ id, icon }) => (
        <SidebarNavButton
          key={id}
          active={tab === id}
          icon={icon}
          stacked={stacked}
          data-tour={`tab-${id}`}
          onClick={() => setTab(id)}
        >
          {t(`team.tabs.${id}`)}
        </SidebarNavButton>
      ))}
    </nav>
  )

  return (
    <Layout
      sidebar={
        <AppSidebarChrome subtitle={team?.name ?? t('team.fallbackTitle')}>
          {tabButtons(true)}
        </AppSidebarChrome>
      }
      mobileNav={tabButtons(false)}
    >
      <Link to="/app" className={backLinkClass}>
        ← {t('team.back')}
      </Link>

      <section className="mt-5 mb-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        {team?.coverMedia?.url ? (
          <img
            src={team.coverMedia.url}
            alt=""
            className="aspect-square w-full max-w-[11rem] shrink-0 rounded-3xl object-cover shadow-panel sm:w-44"
          />
        ) : (
          <div
            className="aspect-square w-full max-w-[11rem] shrink-0 rounded-3xl shadow-panel sm:w-44"
            style={{
              background: `linear-gradient(145deg, ${team?.brandColor || 'var(--brand)'} 0%, color-mix(in oklab, ${team?.brandColor || 'var(--brand)'} 45%, #0a4541) 100%)`,
            }}
          />
        )}
        <div className="min-w-0 flex-1">
          <PageTitle className="!mt-0">{team?.name ?? t('team.fallbackTitle')}</PageTitle>
          <p className="mt-2 max-w-xl text-muted">{t('team.tributesPublishHint')}</p>
          {team?.encryptionEnabled && (
            <p className="mt-1 text-sm font-semibold text-brand">{t('encryption.lockedBadge')}</p>
          )}
        </div>
      </section>

      {!teamCrypto.ready ? (
        <p className="text-muted">{t('team.loading')}</p>
      ) : teamCrypto.missing ? (
        <TeamEncryptionUnlock onUnlock={teamCrypto.unlock} rejected={teamCrypto.keyRejected} />
      ) : (
        <>
          {tab === 'members' && <MembersTab teamId={teamId} />}
          {tab === 'tributes' && (
            <TributesTab
              teamId={teamId}
              cryptoKey={cryptoKey}
              onWrongKey={teamCrypto.rejectWrongKey}
            />
          )}
          {tab === 'characteristics' && <CharacteristicsTab teamId={teamId} />}
          {tab === 'memories' && (
            <MemoriesTab
              teamId={teamId}
              cryptoKey={cryptoKey}
              onWrongKey={teamCrypto.rejectWrongKey}
            />
          )}
          {tab === 'topics' && <TopicsTab teamId={teamId} />}
          {tab === 'search' && <SearchTab teamId={teamId} />}
          {tab === 'yearbook' && (
            <YearbookTab teamId={teamId} team={team} reTeam={reTeam} />
          )}
          {tab === 'personalSettings' && (
            <PreferencesTab
              teamId={teamId}
              encryptionEnabled={!!team?.encryptionEnabled}
              teamCrypto={teamCrypto}
            />
          )}
          {tab === 'adminSettings' && isAdmin && (
            <AdminSettingsTab teamId={teamId} myMemberId={membership?.id} />
          )}
        </>
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
    <section className={cn(panelClass, stackClass)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={sectionTitleClass}>
          {t('team.tabs.members')}
          {items.length > 0 && (
            <span className="ms-2 text-base font-sans font-semibold text-muted">
              ({items.length}{hasNext ? '+' : ''})
            </span>
          )}
        </h2>
        <Label className="mb-0 w-full sm:max-w-xs">
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
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((m) => (
          <Link
            key={m.id}
            to={`/members/${m.id}`}
            className="group flex flex-col items-center rounded-2xl px-2 py-4 text-center transition hover:bg-[color-mix(in_oklab,var(--brand)_6%,transparent)]"
          >
            <Avatar name={m.nickname} src={m.avatar?.url} size="md" className="!h-20 !w-20 !text-2xl" />
            <strong className="mt-3 line-clamp-1 text-sm text-ink group-hover:text-brand">
              {m.nickname}
            </strong>
            <span
              className={cn(
                'mt-1 text-xs capitalize',
                m.role === 'ADMIN' ? 'font-semibold text-brand' : 'text-muted',
              )}
            >
              {(m.role ?? 'member').toLowerCase()}
            </span>
          </Link>
        ))}
      </div>
      <InfiniteSentinel ref={sentinelRef}>
        {loading ? t('team.loading') : hasNext ? t('team.scrollMore') : t('team.endList')}
      </InfiniteSentinel>
    </section>
  )
}

function TributesTab({
  teamId,
  cryptoKey,
  onWrongKey,
}: {
  teamId: string
  cryptoKey: CryptoKey | null
  onWrongKey: () => Promise<void>
}) {
  const { t } = useTranslation()
  const [{ data: membersPage }] = useApiQuery(
    !!teamId,
    () => api.teamMembers(teamId, { first: 100 }),
    [teamId],
  )
  const [{ data: me }] = useApiQuery(!!teamId, () => api.myTeamMembership(teamId), [teamId])
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
  const [, publishTribute] = useApiMutation((tributeId: string) => api.publishTribute(tributeId))
  const [, unpublishTribute] = useApiMutation((tributeId: string) => api.unpublishTribute(tributeId))
  const [items, setItems] = useState<Tribute[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [text, setText] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [privateTribute, setPrivateTribute] = useState(false)
  const cursorRef = useRef<string | null>(null)
  const members = membersPage?.items ?? []
  const writingToSelf = !!me && recipientId === me.id

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  useEffect(() => {
    if (recipientId) return
    const other = members.find((m) => m.id !== me?.id)
    setRecipientId(other?.id ?? members[0]?.id ?? '')
  }, [members, recipientId, me?.id])

  useEffect(() => {
    if (writingToSelf) setAnonymous(false)
  }, [writingToSelf])

  const load = useCallback(
    async (reset = false) => {
      try {
        const page = await api.tributes(teamId, {
          first: 12,
          after: reset ? undefined : cursorRef.current ?? undefined,
        })
        const decrypted = await decryptTributes(cryptoKey, page.items)
        setItems((prev) => (reset ? decrypted : [...prev, ...decrypted]))
        setCursor(page.nextCursor ?? null)
        setHasNext(page.hasNext)
      } catch (err) {
        if (isWrongTeamKeyError(err)) {
          await onWrongKey()
          toast.error(t('encryption.wrongKey'))
          return
        }
        throw err
      }
    },
    [teamId, cryptoKey, onWrongKey, t],
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
    const encryptedText = await prepareTributePayload(cryptoKey, text)
    const result = await createTribute(teamId, {
      recipientId,
      text: encryptedText,
      anonymous: writingToSelf ? false : anonymous,
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
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={cn(panelClass, stackClass)}>
        <h2 className={sectionTitleClass}>{t('team.tributes')}</h2>
        {items.length === 0 && <p className="text-muted">{t('team.noTributes')}</p>}
        {items.map((tribute) => (
          <article key={tribute.id} className={tributeCardClass}>
            <p className="whitespace-pre-wrap text-ink">{tribute.text}</p>
            {tribute.pictures?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tribute.pictures.map((pic) =>
                  pic.id && pic.url ? (
                    <EncryptedImage
                      key={pic.id}
                      url={pic.url}
                      cryptoKey={cryptoKey}
                      alt=""
                      className="h-28 w-28 rounded-xl border border-line object-cover"
                    />
                  ) : null,
                )}
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
              {!tribute.privateTribute && (
                <Chip>{tribute.published ? t('team.published') : t('team.unpublished')}</Chip>
              )}
            </div>
            {me?.id === tribute.recipient?.id && !tribute.privateTribute && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tribute.published ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      unpublishTribute(tribute.id).then((r) => {
                        if (r.error) toast.error(r.error.message)
                        else {
                          toast.success(t('team.tributeUnpublished'))
                          void load(true)
                        }
                      })
                    }
                  >
                    {t('team.unpublish')}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      publishTribute(tribute.id).then((r) => {
                        if (r.error) toast.error(r.error.message)
                        else {
                          toast.success(t('team.tributePublished'))
                          void load(true)
                        }
                      })
                    }
                  >
                    {t('team.publish')}
                  </Button>
                )}
              </div>
            )}
          </article>
        ))}
        <InfiniteSentinel ref={sentinelRef}>
          {hasNext ? t('team.moreTributes') : t('team.noMoreTributes')}
        </InfiniteSentinel>
      </section>

      <form className={cn(panelClass, stackClass)} onSubmit={onCreate}>
        <h2 className={sectionTitleClass}>{t('team.writeTribute')}</h2>
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
        {!writingToSelf && (
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            {t('team.anonymous')}
          </label>
        )}
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
    <div className="grid gap-5 md:grid-cols-2">
      <section className={stackClass}>
        <h2 className={sectionTitleClass}>{t('team.characteristics')}</h2>
        {loading && <p className="text-muted">{t('team.loading')}</p>}
        {!loading && rows.length === 0 && (
          <p className="text-muted">{t('team.noCharacteristics')}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>
      </section>

      <form className={cn(panelClass, stackClass, 'h-fit')} onSubmit={onAdd}>
        <h2 className={sectionTitleClass}>{t('team.addCharacteristic')}</h2>
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

function MemoriesTab({
  teamId,
  cryptoKey,
  onWrongKey,
}: {
  teamId: string
  cryptoKey: CryptoKey | null
  onWrongKey: () => Promise<void>
}) {
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
      try {
        const page = await api.memories(teamId, {
          first: 10,
          after: reset ? undefined : cursorRef.current ?? undefined,
        })
        const decrypted = await decryptMemories(cryptoKey, page.items)
        setItems((prev) => (reset ? decrypted : [...prev, ...decrypted]))
        setCursor(page.nextCursor ?? null)
        setHasNext(page.hasNext)
      } catch (err) {
        if (isWrongTeamKeyError(err)) {
          await onWrongKey()
          toast.error(t('encryption.wrongKey'))
          return
        }
        throw err
      }
    },
    [teamId, cryptoKey, onWrongKey, t],
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
        const uploaded = await uploadTeamMedia(file, cryptoKey)
        mediaIds.push(uploaded.id)
      }
      const encrypted = await prepareMemoryPayload(cryptoKey, title, bodyText)
      const result = await createMemory(teamId, {
        title: encrypted.title,
        bodyText: encrypted.bodyText,
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
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <section className={stackClass}>
        {items.map((m) => {
          const hero = m.pictures?.[0]
          return (
            <article key={m.id} className={cn(panelClass, '!overflow-hidden !p-0')}>
              {hero?.url && (
                <EncryptedImage
                  url={hero.url}
                  cryptoKey={cryptoKey}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              )}
              <div className="p-5 sm:p-6">
                <h3 className="font-display text-xl tracking-tight text-brand sm:text-2xl">
                  {m.title || t('team.untitledMemory')}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-ink">{m.bodyText}</p>
                {m.pictures && m.pictures.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.pictures.slice(1).map((pic) =>
                      pic.url ? (
                        <EncryptedImage
                          key={pic.id ?? pic.url}
                          url={pic.url}
                          cryptoKey={cryptoKey}
                          alt=""
                          className="h-20 w-20 rounded-xl border border-line object-cover"
                        />
                      ) : null,
                    )}
                  </div>
                )}
                <div className="mt-3 text-sm font-semibold text-brand">— {m.writer.nickname}</div>
                <MemoryComments memoryId={m.id} cryptoKey={cryptoKey} />
              </div>
            </article>
          )
        })}
        <InfiniteSentinel ref={sentinelRef}>
          {hasNext ? t('team.moreMemories') : t('team.noMoreMemories')}
        </InfiniteSentinel>
      </section>
      <form className={cn(panelClass, stackClass, 'h-fit')} onSubmit={onCreate}>
        <h2 className={sectionTitleClass}>{t('team.shareMemory')}</h2>
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
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <section className={cn(panelClass, stackClass)}>
        <h2 className={sectionTitleClass}>{t('team.awardTopics')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(topics ?? []).map((topic: Topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedTopic(topic.id)}
              className={cn(
                'rounded-2xl border p-4 text-start transition',
                selectedTopic === topic.id
                  ? 'border-brand bg-[color-mix(in_oklab,var(--brand)_8%,white)] shadow-panel'
                  : 'border-line bg-panel-strong hover:border-brand/35',
              )}
            >
              <strong className="font-display text-lg tracking-tight text-brand">{topic.title}</strong>
              <p className="mt-1 text-xs font-semibold text-muted">{t('team.voteStandings')} →</p>
            </button>
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
        <h2 className={sectionTitleClass}>{t('team.voteStandings')}</h2>
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
        <ol className={stackClass}>
          {(standings ?? []).map((s: TopicStanding, index: number) => (
            <li
              key={s.nominee.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-[color-mix(in_oklab,var(--panel-strong)_80%,var(--paper))] px-3 py-2.5"
            >
              <span
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  index === 0
                    ? 'bg-brand text-on-brand'
                    : 'bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-brand',
                )}
              >
                {index + 1}
              </span>
              <strong className="min-w-0 flex-1 truncate">{s.nominee.nickname}</strong>
              <span className="text-sm font-semibold text-muted">{s.score}</span>
            </li>
          ))}
        </ol>
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
  const [, updateSettings] = useApiMutation(
    (
      id: string,
      body: { brandColor?: string | null; coverMediaId?: string | null },
    ) => api.updateTeamSettings(id, body),
  )

  const [title, setTitle] = useState(team?.yearbookTitle ?? '')
  const [subtitle, setSubtitle] = useState(team?.yearbookSubtitle ?? '')
  const [dedication, setDedication] = useState(team?.yearbookDedication ?? '')
  const [theme, setTheme] = useState<YearbookThemeOption>(
    (team?.yearbookTheme as YearbookThemeOption | undefined) ?? 'CLASSIC',
  )
  const [brandColor, setBrandColor] = useState(team?.brandColor ?? '#0F766E')
  const [showMembers, setShowMembers] = useState(team?.yearbookShowMembers ?? true)
  const [showTributes, setShowTributes] = useState(team?.yearbookShowTributes ?? true)
  const [showCharacteristics, setShowCharacteristics] = useState(
    team?.yearbookShowCharacteristics ?? true,
  )
  const [showMemories, setShowMemories] = useState(team?.yearbookShowMemories ?? true)
  const [showAwards, setShowAwards] = useState(team?.yearbookShowAwards ?? true)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => {
    setTitle(team?.yearbookTitle ?? '')
    setSubtitle(team?.yearbookSubtitle ?? '')
    setDedication(team?.yearbookDedication ?? '')
    setTheme((team?.yearbookTheme as YearbookThemeOption | undefined) ?? 'CLASSIC')
    setBrandColor(team?.brandColor ?? '#0F766E')
    setShowMembers(team?.yearbookShowMembers ?? true)
    setShowTributes(team?.yearbookShowTributes ?? true)
    setShowCharacteristics(team?.yearbookShowCharacteristics ?? true)
    setShowMemories(team?.yearbookShowMemories ?? true)
    setShowAwards(team?.yearbookShowAwards ?? true)
  }, [team])

  async function saveCustomization(showToast = true) {
    const normalizedColor = normalizeHexColor(brandColor)
    if (!normalizedColor) {
      toast.error(t('team.brandColorInvalid'))
      return false
    }
    const [yearbookResult, settingsResult] = await Promise.all([
      updateYearbook(teamId, {
        title,
        subtitle,
        dedication,
        theme,
        showMembers,
        showTributes,
        showCharacteristics,
        showMemories,
        showAwards,
      }),
      updateSettings(teamId, { brandColor: normalizedColor }),
    ])
    if (yearbookResult.error) {
      toast.error(yearbookResult.error.message)
      return false
    }
    if (settingsResult.error) {
      toast.error(settingsResult.error.message)
      return false
    }
    setBrandColor(normalizedColor)
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

  async function onCoverImage(file: File | null) {
    if (!file) return
    setUploadingCover(true)
    try {
      // Cover stays plaintext so branding works without decrypting the whole yearbook chrome.
      const uploaded = await uploadTeamMedia(file, null)
      const result = await updateSettings(teamId, { coverMediaId: uploaded.id })
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(t('team.coverUpdated'))
      reTeam()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('team.uploadFailed'))
    } finally {
      setUploadingCover(false)
    }
  }

  return (
    <div className="grid gap-4">
      <section className={cn(panelClass, stackClass)}>
        <h2 className={cn(sectionTitleClass, "flex items-center gap-2")}>
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

      <form className={cn(panelClass, stackClass)} onSubmit={onSaveCustomization}>
        <h2 className={sectionTitleClass}>{t('team.customize')}</h2>
        <p className="text-muted">{t('team.customizeHint')}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {team?.coverMedia?.url ? (
            <img
              src={team.coverMedia.url}
              alt=""
              className="aspect-square w-full max-w-[10rem] shrink-0 rounded-3xl object-cover shadow-sm"
            />
          ) : (
            <div
              className="aspect-square w-full max-w-[10rem] shrink-0 rounded-3xl shadow-sm"
              style={{
                background: `linear-gradient(145deg, ${brandColor || 'var(--brand)'} 0%, color-mix(in oklab, ${brandColor || 'var(--brand)'} 45%, #0a4541) 100%)`,
              }}
            />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="font-semibold text-ink">{t('team.coverImage')}</p>
            <p className="text-sm text-muted">{t('team.coverImageHint')}</p>
            <Label className="mb-0">
              <span className="sr-only">{t('team.coverImage')}</span>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploadingCover || saving}
                onChange={(e) => {
                  void onCoverImage(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />
            </Label>
            {uploadingCover && <p className="text-sm text-muted">{t('team.uploadingCover')}</p>}
          </div>
        </div>

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
        <Label>
          {t('team.brandColor')}
          <ColorPicker
            value={brandColor}
            aria-label={t('team.brandColor')}
            onChange={setBrandColor}
          />
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

function PreferencesTab({
  teamId,
  encryptionEnabled,
  teamCrypto,
}: {
  teamId: string
  encryptionEnabled: boolean
  teamCrypto: ReturnType<typeof useTeamCrypto>
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
  const [, leaveTeam] = useApiMutation((id: string) => api.leaveTeam(id))
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      const uploaded = await uploadTeamMedia(file, null)
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

  async function showSavedKey() {
    const keyB64 = await teamCrypto.peekKey()
    setRevealedKey(keyB64)
  }

  async function copySavedKey() {
    const keyB64 = revealedKey ?? (await teamCrypto.peekKey())
    if (!keyB64) return
    await navigator.clipboard.writeText(keyB64)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function removeLocalKey() {
    if (!window.confirm(t('encryption.removeLocalKey'))) return
    await teamCrypto.lockLocal()
    setRevealedKey(null)
  }

  async function onLeave() {
    if (!window.confirm(t('team.leaveConfirm'))) return
    setLeaving(true)
    try {
      const result = await leaveTeam(teamId)
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(result.data?.message || t('team.leaveSuccess'))
      void navigate('/app')
    } finally {
      setLeaving(false)
    }
  }

  if (fetching && !membership) {
    return <p className="text-muted">{t('team.loadingProfile')}</p>
  }
  if (error) {
    return <p className="text-danger">{error.message}</p>
  }

  return (
    <div className={cn(stackClass, 'max-w-lg')}>
      <form className={cn(panelClass, stackClass)} onSubmit={onSave}>
        <h2 className={sectionTitleClass}>{t('team.yourProfile')}</h2>
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
      {encryptionEnabled && (
        <div className={cn(panelClass, stackClass)}>
          <h2 className={sectionTitleClass}>{t('encryption.keyLabel')}</h2>
          <p className="text-muted">{t('encryption.unlockBody')}</p>
          {revealedKey ? (
            <>
              <code className="break-all rounded-xl border border-line bg-panel-strong px-3 py-2 text-sm">
                {revealedKey}
              </code>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => void copySavedKey()}>
                  {copied ? t('encryption.copied') : t('encryption.copyKey')}
                </Button>
                <Button type="button" variant="secondary" onClick={() => void removeLocalKey()}>
                  {t('encryption.removeLocalKey')}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void showSavedKey()}>
                {t('encryption.showKey')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void removeLocalKey()}>
                {t('encryption.removeLocalKey')}
              </Button>
            </div>
          )}
        </div>
      )}
      <div className={cn(panelClass, stackClass)}>
        <h2 className={sectionTitleClass}>{t('team.leaveTitle')}</h2>
        <p className="text-muted">{t('team.leaveHint')}</p>
        <Button
          type="button"
          variant="secondary"
          className="border-danger text-danger hover:bg-danger/10"
          disabled={leaving}
          onClick={() => {
            void onLeave()
          }}
        >
          {leaving ? t('team.leaving') : t('team.leave')}
        </Button>
      </div>
    </div>
  )
}

function SettingsTab({ teamId }: { teamId: string }) {
  const { t } = useTranslation()
  const [, createInvite] = useApiMutation(
    (id: string, body: { role?: string | null; maxUses?: number | null }) =>
      api.createInvite(id, body),
  )
  const [, inviteByEmail] = useApiMutation(
    (id: string, email: string, role: string) => api.inviteByEmail(id, email, role),
  )
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

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

  return (
    <section className={cn(panelClass, stackClass, 'max-w-xl')}>
      <h2 className={sectionTitleClass}>{t('team.invites')}</h2>
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
  )
}

function AdminSettingsTab({
  teamId,
  myMemberId,
}: {
  teamId: string
  myMemberId?: string
}) {
  const { t } = useTranslation()
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [, removeMember] = useApiMutation((tid: string, memberId: string) =>
    api.removeTeamMember(tid, memberId),
  )

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const page = await api.teamMembers(teamId, { first: 50 })
      setItems(page.items)
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  async function onRemove(member: TeamMember) {
    if (!window.confirm(t('team.removeMemberConfirm', { name: member.nickname }))) return
    setRemovingId(member.id)
    try {
      const result = await removeMember(teamId, member.id)
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success(t('team.memberRemoved', { name: member.nickname }))
      await loadMembers()
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className={stackClass}>
      <SettingsTab teamId={teamId} />
      <section className={cn(panelClass, stackClass, 'max-w-xl')}>
        <h2 className={sectionTitleClass}>{t('team.manageMembers')}</h2>
        <p className="text-sm text-muted">{t('team.manageMembersHint')}</p>
        {loading && items.length === 0 ? (
          <p className="text-muted">{t('team.loading')}</p>
        ) : (
          <ul className={stackClass}>
            {items.map((member) => {
              const isSelf = member.id === myMemberId
              return (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{member.nickname}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {(member.role ?? 'member').toLowerCase()}
                      {isSelf ? ` · ${t('team.you')}` : ''}
                    </p>
                  </div>
                  {!isSelf && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="border-danger text-danger hover:bg-danger/10"
                      disabled={removingId === member.id}
                      onClick={() => {
                        void onRemove(member)
                      }}
                    >
                      {removingId === member.id ? t('team.removing') : t('team.removeMember')}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
