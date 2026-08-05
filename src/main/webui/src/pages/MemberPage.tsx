import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../api/client'
import type { Tribute } from '../api/types'
import { useApiMutation, useApiQuery } from '../api/useApi'
import Layout from '../components/Layout'
import { TeamEncryptionUnlock } from '../components/TeamEncryptionUnlock'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Input, Label, Textarea } from '../components/ui/Field'
import { InfiniteSentinel } from '../components/ui/InfiniteSentinel'
import { PageTitle } from '../components/ui/PageTitle'
import { Avatar } from '../components/ui/Avatar'
import { EncryptedImage } from '../crypto/EncryptedImage'
import { decryptTributes, prepareTributePayload } from '../crypto/contentCrypto'
import { useTeamCrypto } from '../crypto/useTeamCrypto'
import { isWrongTeamKeyError } from '../crypto/verifyTeamKey'
import { cn } from '../lib/cn'
import { backLinkClass, panelClass, sectionTitleClass, stackClass, tributeCardClass } from '../components/ui/styles'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'

export default function MemberPage() {
  const { t } = useTranslation()
  const { memberId = '' } = useParams()
  const [{ data: member }] = useApiQuery(!!memberId, () => api.teamMember(memberId), [memberId])
  const [{ data: team }] = useApiQuery(
    !!member?.teamId,
    () => api.team(member!.teamId),
    [member?.teamId],
  )
  const teamCrypto = useTeamCrypto(member?.teamId, team?.encryptionEnabled)
  const [{ data: me }] = useApiQuery(
    !!member?.teamId,
    () => api.myTeamMembership(member!.teamId),
    [member?.teamId],
  )
  const [{ data: characteristics = [] }, reChars] = useApiQuery(
    !!memberId,
    () => api.characteristics(memberId),
    [memberId],
  )
  const [, createTribute] = useApiMutation(
    (
      teamId: string,
      body: {
        recipientId: string
        text: string
        anonymous: boolean
        privateTribute: boolean
      },
    ) => api.createTribute(teamId, body),
  )
  const [, publishTribute] = useApiMutation((tributeId: string) => api.publishTribute(tributeId))
  const [, unpublishTribute] = useApiMutation((tributeId: string) => api.unpublishTribute(tributeId))
  const [, addCharacteristic] = useApiMutation((teamMemberId: string, title: string) =>
    api.addCharacteristic(teamMemberId, title),
  )
  const isOwnProfile = !!me && !!member && me.id === member.id
  const [text, setText] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [privateTribute, setPrivateTribute] = useState(false)
  const [charTitle, setCharTitle] = useState('')
  const [items, setItems] = useState<Tribute[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const cursorRef = useRef<string | null>(null)

  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  const loadTributes = useCallback(
    async (reset = false) => {
      if (!member) return
      try {
        const page = await api.tributes(member.teamId, {
          recipientId: member.id,
          first: 10,
          after: reset ? undefined : cursorRef.current ?? undefined,
        })
        const decrypted = await decryptTributes(teamCrypto.key, page.items)
        setItems((prev) => (reset ? decrypted : [...prev, ...decrypted]))
        setCursor(page.nextCursor ?? null)
        setHasNext(page.hasNext)
      } catch (err) {
        if (isWrongTeamKeyError(err)) {
          await teamCrypto.rejectWrongKey()
          toast.error(t('encryption.wrongKey'))
          return
        }
        throw err
      }
    },
    [member, teamCrypto.key, teamCrypto.rejectWrongKey, t],
  )

  useEffect(() => {
    setItems([])
    setCursor(null)
    if (member && teamCrypto.ready && !teamCrypto.missing) void loadTributes(true)
  }, [memberId, member?.id, loadTributes, member, teamCrypto.ready, teamCrypto.missing])

  const sentinelRef = useInfiniteScroll(() => {
    if (hasNext) void loadTributes(false)
  }, hasNext)

  async function onTribute(e: FormEvent) {
    e.preventDefault()
    if (!member) return
    const encryptedText = await prepareTributePayload(teamCrypto.key, text)
    const result = await createTribute(member.teamId, {
      recipientId: member.id,
      text: encryptedText,
      anonymous: isOwnProfile ? false : anonymous,
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
    const result = await addCharacteristic(memberId, charTitle)
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
      <Link to={`/teams/${member.teamId}`} className={backLinkClass}>
        ← {t('member.back')}
      </Link>

      {teamCrypto.missing ? (
        <div className="mt-4">
          <TeamEncryptionUnlock onUnlock={teamCrypto.unlock} rejected={teamCrypto.keyRejected} />
        </div>
      ) : (
      <>
      <section className={`${panelClass} mt-4`}>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <Avatar name={member.nickname} src={member.avatar?.url} size="xl" shape="rounded" />
          <div className="min-w-0 flex-1 text-center sm:text-start">
            <PageTitle className="!mt-0">{member.nickname}</PageTitle>
            <p className="mt-2 max-w-xl text-muted">{member.bio || t('member.noBio')}</p>
            {characteristics.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {characteristics.map((c: { id: string; title: string; count: number }) => (
                  <Chip key={c.id}>
                    {c.title} × {c.count}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className={`${panelClass} ${stackClass}`}>
          <h2 className={sectionTitleClass}>{t('member.tributes')}</h2>
          {items.length === 0 && <p className="text-muted">{t('member.noTributes')}</p>}
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
                        cryptoKey={teamCrypto.key}
                        alt=""
                        className="h-28 w-28 rounded-2xl border border-line object-cover"
                      />
                    ) : null,
                  )}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
                <span>— {tribute.writer?.nickname}</span>
                {tribute.anonymous && <Chip>{t('member.anonymous')}</Chip>}
                {tribute.privateTribute && <Chip>{t('member.private')}</Chip>}
                {!tribute.privateTribute && (
                  <Chip>{tribute.published ? t('member.published') : t('member.unpublished')}</Chip>
                )}
              </div>
              {isOwnProfile && !tribute.privateTribute && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tribute.published ? (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        unpublishTribute(tribute.id).then((r) => {
                          if (r.error) toast.error(r.error.message)
                          else {
                            toast.success(t('member.tributeUnpublished'))
                            void loadTributes(true)
                          }
                        })
                      }
                    >
                      {t('member.unpublish')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        publishTribute(tribute.id).then((r) => {
                          if (r.error) toast.error(r.error.message)
                          else {
                            toast.success(t('member.tributePublished'))
                            void loadTributes(true)
                          }
                        })
                      }
                    >
                      {t('member.publish')}
                    </Button>
                  )}
                </div>
              )}
            </article>
          ))}
          <InfiniteSentinel ref={sentinelRef}>
            {hasNext ? t('member.moreTributes') : t('member.endTributes')}
          </InfiniteSentinel>
        </section>

        <div className={stackClass}>
          <form className={cn(panelClass, stackClass)} onSubmit={onTribute}>
            <h2 className={sectionTitleClass}>
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
            {!isOwnProfile && (
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                {t('member.anonymous')}
              </label>
            )}
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
            <h2 className={sectionTitleClass}>{t('member.characteristics')}</h2>
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
              to={`/teams/${member.teamId}?tab=settings`}
              className="font-semibold text-brand hover:underline"
            >
              {t('member.preferences')}
            </Link>{' '}
            {t('member.editHintAfter')}
          </p>
        </div>
      </div>
      </>
      )}
    </Layout>
  )
}
