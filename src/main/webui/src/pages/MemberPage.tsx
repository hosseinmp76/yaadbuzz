import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useClient, useMutation, useQuery } from 'urql'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Input, Label, Textarea } from '../components/ui/Field'
import { InfiniteSentinel } from '../components/ui/InfiniteSentinel'
import { PageTitle } from '../components/ui/PageTitle'
import { Avatar } from '../components/ui/Avatar'
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
} from '../api/queries'

export default function MemberPage() {
  const { t } = useTranslation()
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
  const [, hideTribute] = useMutation(HIDE_TRIBUTE)
  const [, reportTribute] = useMutation(REPORT_TRIBUTE)
  const client = useClient()

  const [text, setText] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [privateTribute, setPrivateTribute] = useState(false)
  const [charTitle, setCharTitle] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const cursorRef = useRef<string | null>(null)
  const characteristics = charsData?.characteristics ?? []

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

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
    toast.success(t('member.tributeSaved'))
    setText('')
    setAnonymous(false)
    setPrivateTribute(false)
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
    toast.success(t('member.charAdded'))
    setCharTitle('')
    reChars({ requestPolicy: 'network-only' })
  }

  if (!member) {
    return (
      <Layout>
        <p className="text-muted">{t('member.loading')}</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <Link
        to={`/teams/${member.teamId}`}
        className="text-sm font-semibold text-muted hover:text-ink"
      >
        {t('member.back')}
      </Link>
      <PageTitle>{member.nickname}</PageTitle>
      <p className="text-muted">{member.bio || t('member.noBio')}</p>
      <Avatar name={member.nickname} src={member.avatar?.url} size="lg" className="mt-3" />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className={stackClass}>
          <h2 className="font-display text-xl tracking-tight">{t('member.tributes')}</h2>
          {items.length === 0 && <p className="text-muted">{t('member.noTributes')}</p>}
          {items.map((tribute) => (
            <article key={tribute.id} className={panelClass}>
              <p className="whitespace-pre-wrap">{tribute.text}</p>
              {tribute.pictures?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tribute.pictures.map((pic: { id: string; url: string }) => (
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
                <span>— {tribute.writer?.nickname}</span>
                {tribute.anonymous && <Chip>{t('member.anonymous')}</Chip>}
                {tribute.privateTribute && <Chip>{t('member.private')}</Chip>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    reportTribute({ tributeId: tribute.id, reason: 'Inappropriate' }).then((r) => {
                      if (r.error) toast.error(r.error.message)
                      else toast.success(t('member.reported'))
                    })
                  }
                >
                  {t('member.report')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    hideTribute({ tributeId: tribute.id }).then((r) => {
                      if (r.error) toast.error(r.error.message)
                      else {
                        toast.success(t('member.hidden'))
                        void loadTributes(true)
                      }
                    })
                  }
                >
                  {t('member.hide')}
                </Button>
              </div>
            </article>
          ))}
          <InfiniteSentinel ref={sentinelRef}>
            {hasNext ? t('member.moreTributes') : t('member.endTributes')}
          </InfiniteSentinel>
        </section>

        <div className={stackClass}>
          <form className={cn(panelClass, stackClass)} onSubmit={onTribute}>
            <h2 className="font-display text-xl tracking-tight">
              {t('member.writeAbout', { name: member.nickname })}
            </h2>
            <Label>
              {t('member.message')}
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
              {t('member.anonymous')}
            </label>
            <label className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={privateTribute}
                onChange={(e) => setPrivateTribute(e.target.checked)}
              />
              {t('member.private')}
            </label>
            <Button type="submit">{t('member.saveTribute')}</Button>
          </form>

          <form className={cn(panelClass, stackClass)} onSubmit={onCharacteristic}>
            <h2 className="font-display text-xl tracking-tight">{t('member.characteristics')}</h2>
            {characteristics.length === 0 ? (
              <p className="text-sm text-muted">{t('member.noCharacteristics')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {characteristics.map((c: { id: string; title: string; count: number }) => (
                  <Chip key={c.id}>
                    {c.title} × {c.count}
                  </Chip>
                ))}
              </div>
            )}
            <Label>
              {t('member.addTag')}
              <Input value={charTitle} onChange={(e) => setCharTitle(e.target.value)} required />
            </Label>
            <Button type="submit">{t('member.add')}</Button>
          </form>

          <p className="text-sm text-muted">
            {t('member.editHintBefore')}{' '}
            <Link
              to={`/teams/${member.teamId}?tab=preferences`}
              className="font-semibold text-brand hover:underline"
            >
              {t('member.preferences')}
            </Link>{' '}
            {t('member.editHintAfter')}
          </p>
        </div>
      </div>
    </Layout>
  )
}
