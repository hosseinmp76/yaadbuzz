import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useClient, useMutation, useQuery } from 'urql'
import Layout from '../components/Layout'
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
  const [message, setMessage] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    if (member) {
      setBio(member.bio || '')
      setNickname(member.nickname || '')
    }
  }, [member])

  const loadTributes = useCallback(async (reset = false) => {
    if (!member) return
    const result = await client.query(TRIBUTES, {
      teamId: member.teamId,
      recipientId: member.id,
      first: 10,
      after: reset ? null : cursor,
    }).toPromise()
    const page = result.data?.tributes
    if (page) {
      setItems((prev) => reset ? page.items : [...prev, ...page.items])
      setCursor(page.nextCursor)
      setHasNext(page.hasNext)
    }
  }, [client, member, cursor])

  useEffect(() => {
    setItems([])
    setCursor(null)
    if (member) void loadTributes(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, member?.id])

  const sentinelRef = useInfiniteScroll(() => { if (hasNext) void loadTributes(false) }, hasNext)

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
    setMessage(result.error ? result.error.message : 'Tribute saved')
    if (!result.error) {
      setText('')
      setCursor(null)
      await loadTributes(true)
    }
  }

  async function onCharacteristic(e: FormEvent) {
    e.preventDefault()
    const result = await addCharacteristic({ teamMemberId: memberId, title: charTitle })
    setMessage(result.error ? result.error.message : 'Characteristic added')
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
    setMessage(result.error ? result.error.message : 'Profile updated')
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
      setMessage(result.error ? result.error.message : 'Avatar updated')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  if (!member) {
    return <Layout><p className="muted">Loading member…</p></Layout>
  }

  return (
    <Layout>
      <Link to={`/teams/${member.teamId}`} className="muted">← Back to team</Link>
      <h1 className="page-title">{member.nickname}</h1>
      <p className="muted">{member.bio || 'No bio yet'}</p>
      {member.avatar?.url && <img src={member.avatar.url} alt="" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />}
      {message && <p className="muted">{message}</p>}

      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <section className="stack">
          <h2>Tributes</h2>
          {items.map((t) => (
            <article key={t.id} className="panel">
              <p>{t.text}</p>
              <div className="muted">— {t.writer?.nickname}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="secondary" onClick={() => reportTribute({ tributeId: t.id, reason: 'Inappropriate' })}>Report</button>
                <button className="secondary" onClick={() => hideTribute({ tributeId: t.id }).then(() => loadTributes(true))}>Hide</button>
              </div>
            </article>
          ))}
          <div ref={sentinelRef} className="infinite-sentinel">{hasNext ? 'Loading more…' : 'End of tributes'}</div>
        </section>

        <div className="stack">
          <form className="panel" onSubmit={onTribute}>
            <h2>Write about {member.nickname}</h2>
            <label>Message<textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} required /></label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} /> Anonymous
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" checked={privateTribute} onChange={(e) => setPrivateTribute(e.target.checked)} /> Private
            </label>
            <button type="submit">Save tribute</button>
          </form>

          <form className="panel" onSubmit={onCharacteristic}>
            <h2>Characteristics</h2>
            <div>
              {(charsData?.characteristics ?? []).map((c: any) => (
                <span key={c.id} className="chip">{c.title} × {c.count}</span>
              ))}
            </div>
            <label>Add tag<input value={charTitle} onChange={(e) => setCharTitle(e.target.value)} required /></label>
            <button type="submit">Add</button>
          </form>

          <form className="panel" onSubmit={onProfile}>
            <h2>Edit your profile</h2>
            <p className="muted">Only updates if this member profile is yours.</p>
            <label>Nickname<input value={nickname} onChange={(e) => setNickname(e.target.value)} /></label>
            <label>Bio<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></label>
            <label>Avatar<input type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0] ?? null)} /></label>
            <button type="submit">Update profile</button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
