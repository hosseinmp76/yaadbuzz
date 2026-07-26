import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useClient, useMutation, useQuery } from 'urql'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Input, Label, Textarea } from '../components/ui/Field'
import { InfiniteSentinel } from '../components/ui/InfiniteSentinel'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import {
  ADD_CHARACTERISTIC,
  CHARACTERISTICS,
  CREATE_TRIBUTE,
  HIDE_TRIBUTE,
  REPORT_TRIBUTE,
  TEAM_MEMBER,
  TRIBUTES,
  UPSERT_PROFILE,
} from '../api/queries'
import { uploadMedia } from '../api/graphql'

export default function MemberPage() {
  const { memberId = '' } = useParams()
  const [{ data }] = useQuery({ query: TEAM_MEMBER, variables: { id: memberId } })
  const member = data?.teamMember
  const [{ data: charsData }, reChars] = useQuery({
    query: CHARACTERISTICS,
    variables: { teamMemberId: memberId },
    pause: !memberId,
  })
  const [, createTribute] = useMutation(CREATE_TRIBUTE)
  const [, addCharacteristic] = useMutation(ADD_CHARACTERISTIC)
  const [, upsertProfile] = useMutation(UPSERT_PROFILE)
  const [, hideTribute] = useMutation(HIDE_TRIBUTE)
  const [, reportTribute] = useMutation(REPORT_TRIBUTE)
  const client = useClient()

  const [text, setText] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [privateTribute, setPrivateTribute] = useState(false)
  const [charTitle, setCharTitle] = useState('')
  const [bio, setBio] = useState('')
  const [nickname, setNickname] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const cursorRef = useRef<string | null>(null)

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  useEffect(() => {
    if (member) {
      setBio(member.bio || '')
      setNickname(member.nickname || '')
    }
  }, [member])

  const loadTributes = useCallback(
    async (reset = false) => {
      if (!member) return
      const result = await client
        .query(TRIBUTES, {
          teamId: member.teamId,
          recipientId: member.id,
          first: 10,
          after: reset ? null : cursorRef.current,
        })
        .toPromise()
      const page = result.data?.tributes
      if (page) {
        setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
        setCursor(page.nextCursor)
        setHasNext(page.hasNext)
      }
    },
    [client, member],
  )

  useEffect(() => {
    setItems([])
    setCursor(null)
    if (member) void loadTributes(true)
  }, [memberId, member?.id, loadTributes, member])

  const sentinelRef = useInfiniteScroll(() => {
    if (hasNext) void loadTributes(false)
  }, hasNext)

  async function onTribute(e: FormEvent) {
    e.preventDefault()
    if (!member) return
    const result = await createTribute({
      teamId: member.teamId,
      recipientId: member.id,
      text,
      anonymous,
      privateTribute,
    })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Tribute saved')
    setText('')
    setCursor(null)
    await loadTributes(true)
  }

  async function onCharacteristic(e: FormEvent) {
    e.preventDefault()
    const result = await addCharacteristic({ teamMemberId: memberId, title: charTitle })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Characteristic added')
    setCharTitle('')
    reChars({ requestPolicy: 'network-only' })
  }

  async function onProfile(e: FormEvent) {
    e.preventDefault()
    if (!member) return
    const result = await upsertProfile({
      teamId: member.teamId,
      nickname,
      bio,
      avatarId: null,
    })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Profile updated')
  }

  async function onAvatar(file: File | null) {
    if (!file || !member) return
    try {
      const uploaded = await uploadMedia(file)
      const result = await upsertProfile({
        teamId: member.teamId,
        nickname: null,
        bio: null,
        avatarId: uploaded.id,
      })
      if (result.error) {
        toast.error(result.error.message)
        return
      }
      toast.success('Avatar updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  if (!member) {
    return (
      <Layout>
        <p className="text-muted">Loading member…</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <Link
        to={`/teams/${member.teamId}`}
        className="text-sm font-semibold text-muted hover:text-ink"
      >
        ← Back to team
      </Link>
      <PageTitle>{member.nickname}</PageTitle>
      <p className="text-muted">{member.bio || 'No bio yet'}</p>
      {member.avatar?.url && (
        <img
          src={member.avatar.url}
          alt=""
          className="mt-3 h-24 w-24 rounded-full object-cover"
        />
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className={stackClass}>
          <h2 className="font-display text-xl tracking-tight">Tributes</h2>
          {items.map((t) => (
            <article key={t.id} className={panelClass}>
              <p className="whitespace-pre-wrap">{t.text}</p>
              <div className="mt-2 text-sm text-muted">— {t.writer?.nickname}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    reportTribute({ tributeId: t.id, reason: 'Inappropriate' }).then((r) => {
                      if (r.error) toast.error(r.error.message)
                      else toast.success('Reported')
                    })
                  }
                >
                  Report
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    hideTribute({ tributeId: t.id }).then((r) => {
                      if (r.error) toast.error(r.error.message)
                      else {
                        toast.success('Hidden')
                        void loadTributes(true)
                      }
                    })
                  }
                >
                  Hide
                </Button>
              </div>
            </article>
          ))}
          <InfiniteSentinel ref={sentinelRef}>
            {hasNext ? 'Loading more…' : 'End of tributes'}
          </InfiniteSentinel>
        </section>

        <div className={stackClass}>
          <form className={cn(panelClass, stackClass)} onSubmit={onTribute}>
            <h2 className="font-display text-xl tracking-tight">
              Write about {member.nickname}
            </h2>
            <Label>
              Message
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
              Anonymous
            </label>
            <label className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={privateTribute}
                onChange={(e) => setPrivateTribute(e.target.checked)}
              />
              Private
            </label>
            <Button type="submit">Save tribute</Button>
          </form>

          <form className={cn(panelClass, stackClass)} onSubmit={onCharacteristic}>
            <h2 className="font-display text-xl tracking-tight">Characteristics</h2>
            <div className="flex flex-wrap gap-2">
              {(charsData?.characteristics ?? []).map(
                (c: { id: string; title: string; count: number }) => (
                  <Chip key={c.id}>
                    {c.title} × {c.count}
                  </Chip>
                ),
              )}
            </div>
            <Label>
              Add tag
              <Input value={charTitle} onChange={(e) => setCharTitle(e.target.value)} required />
            </Label>
            <Button type="submit">Add</Button>
          </form>

          <form className={cn(panelClass, stackClass)} onSubmit={onProfile}>
            <h2 className="font-display text-xl tracking-tight">Edit your profile</h2>
            <p className="text-sm text-muted">Only updates if this member profile is yours.</p>
            <Label>
              Nickname
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </Label>
            <Label>
              Bio
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </Label>
            <Label>
              Avatar
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onAvatar(e.target.files?.[0] ?? null)}
              />
            </Label>
            <Button type="submit">Update profile</Button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
