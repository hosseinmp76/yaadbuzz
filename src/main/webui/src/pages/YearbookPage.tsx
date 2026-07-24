import { Printer, ArrowLeft } from '@phosphor-icons/react'
import clsx from 'clsx'
import type { CSSProperties, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'urql'
import { YEARBOOK } from '../api/queries'
import { Button } from '../components/ui/Button'

type YearbookData = {
  teamId: string
  orgName: string
  teamName: string
  title: string
  subtitle: string
  dedication?: string
  theme: 'CLASSIC' | 'MODERN' | 'SCRAPBOOK' | 'MINIMAL'
  brandColor: string
  logoUrl?: string
  coverMediaUrl?: string
  showMembers: boolean
  showTributes: boolean
  showCharacteristics: boolean
  showMemories: boolean
  showAwards: boolean
  members: Array<{
    nickname: string
    bio?: string
    avatarUrl?: string
    characteristics: Array<{ title: string; count: number }>
    tributes: Array<{ text: string; writer: string }>
  }>
  memories: Array<{ title?: string; body: string; writer: string }>
  topics: Array<{
    title: string
    standings: Array<{ nickname: string; score: number }>
  }>
}

export default function YearbookPage() {
  const { teamId = '' } = useParams()
  const [{ data, fetching, error }] = useQuery({
    query: YEARBOOK,
    variables: { teamId },
    pause: !teamId,
  })
  const yearbook = data?.yearbook as YearbookData | undefined

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="no-print mx-auto flex w-[min(1100px,calc(100%-2rem))] items-center justify-between gap-3 py-4">
        <Link
          to={`/teams/${teamId}?tab=yearbook`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft size={18} />
          Back to team
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link to={`/teams/${teamId}?tab=yearbook`}>
            <Button variant="secondary">Customize</Button>
          </Link>
          <Button onClick={() => window.print()}>
            <Printer size={18} />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {fetching && <p className="mx-auto w-[min(800px,calc(100%-2rem))] text-muted">Loading yearbook…</p>}
      {error && <p className="mx-auto w-[min(800px,calc(100%-2rem))] text-danger">{error.message}</p>}
      {yearbook && <YearbookDocument yearbook={yearbook} />}
    </div>
  )
}

function YearbookDocument({ yearbook }: { yearbook: YearbookData }) {
  const theme = yearbook.theme || 'CLASSIC'
  return (
    <article
      className={clsx(
        'yearbook-doc mx-auto mb-16 w-[min(800px,calc(100%-2rem))] overflow-hidden shadow-panel print:mb-0 print:w-full print:max-w-none print:shadow-none',
        theme === 'CLASSIC' && 'font-display',
        theme === 'MODERN' && 'font-body',
        theme === 'SCRAPBOOK' && 'font-display',
        theme === 'MINIMAL' && 'font-body',
      )}
      style={{ '--yb-brand': yearbook.brandColor } as CSSProperties}
    >
      <section
        className={clsx(
          'yearbook-cover flex min-h-[70vh] flex-col items-center justify-center px-8 py-16 text-center print:min-h-[100vh]',
          theme === 'CLASSIC' || theme === 'MODERN'
            ? 'text-white'
            : 'border-t-[12px] text-ink',
          theme === 'SCRAPBOOK' && 'border-[10px] bg-[#faf7f2]',
          theme === 'MINIMAL' && 'bg-white',
        )}
        style={
          theme === 'CLASSIC' || theme === 'MODERN'
            ? {
                background: `linear-gradient(160deg, ${yearbook.brandColor} 0%, color-mix(in oklab, ${yearbook.brandColor} 55%, #0f172a) 70%)`,
              }
            : { borderColor: yearbook.brandColor }
        }
      >
        {yearbook.coverMediaUrl ? (
          <img
            src={yearbook.coverMediaUrl}
            alt=""
            className="mb-6 max-h-40 max-w-[70%] object-contain"
          />
        ) : yearbook.logoUrl ? (
          <img src={yearbook.logoUrl} alt="" className="mb-6 max-h-20 object-contain" />
        ) : null}
        <h1 className="font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-tight tracking-[-0.03em]">
          {yearbook.title}
        </h1>
        <p className="mt-3 text-xl opacity-90">{yearbook.subtitle}</p>
        {yearbook.dedication && (
          <p className="mt-8 max-w-md text-base italic leading-relaxed opacity-90">
            {yearbook.dedication}
          </p>
        )}
        <p className="mt-10 text-sm tracking-[0.2em] uppercase opacity-80">Yaadbuzz</p>
      </section>

      <div className="space-y-10 bg-[color-mix(in_oklab,var(--paper)_92%,white)] px-6 py-10 print:bg-white print:px-0 sm:px-10">
        {yearbook.showMembers && (
          <section>
            <SectionHeading color={yearbook.brandColor} theme={theme}>
              Members
            </SectionHeading>
            <div className="mt-5 space-y-8">
              {yearbook.members.map((member) => (
                <div
                  key={member.nickname}
                  className={clsx(
                    'breakbook-block',
                    theme === 'SCRAPBOOK' && 'rounded-xl border border-line bg-[#fffdf8] p-4',
                  )}
                >
                  <div className="flex items-start gap-4">
                    {member.avatarUrl && (
                      <img
                        src={member.avatarUrl}
                        alt=""
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-2xl tracking-tight">{member.nickname}</h3>
                      {member.bio && <p className="mt-1 text-muted">{member.bio}</p>}
                      {yearbook.showCharacteristics && member.characteristics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.characteristics.map((c) => (
                            <span
                              key={c.title}
                              className="rounded-md px-2 py-1 text-xs font-semibold"
                              style={{
                                background: `color-mix(in oklab, ${yearbook.brandColor} 14%, white)`,
                                color: yearbook.brandColor,
                              }}
                            >
                              {c.title} × {c.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {yearbook.showTributes &&
                    member.tributes.map((t, idx) => (
                      <blockquote
                        key={`${member.nickname}-${idx}`}
                        className="mt-3 border-l-4 bg-panel px-3 py-2"
                        style={{ borderColor: yearbook.brandColor }}
                      >
                        <p className="whitespace-pre-wrap">{t.text}</p>
                        <footer className="mt-1 text-sm text-muted">— {t.writer}</footer>
                      </blockquote>
                    ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {yearbook.showMemories && (
          <section>
            <SectionHeading color={yearbook.brandColor} theme={theme}>
              Memories
            </SectionHeading>
            <div className="mt-5 space-y-5">
              {yearbook.memories.map((memory, idx) => (
                <article key={idx} className="yearbook-block">
                  {memory.title && <strong className="text-lg">{memory.title}</strong>}
                  <p className="mt-1 whitespace-pre-wrap">{memory.body}</p>
                  <p className="mt-2 text-sm text-muted">— {memory.writer}</p>
                </article>
              ))}
              {yearbook.memories.length === 0 && (
                <p className="text-muted">No shared memories yet.</p>
              )}
            </div>
          </section>
        )}

        {yearbook.showAwards && (
          <section>
            <SectionHeading color={yearbook.brandColor} theme={theme}>
              Awards
            </SectionHeading>
            <div className="mt-5 space-y-4">
              {yearbook.topics.map((topic) => (
                <article key={topic.title} className="yearbook-block">
                  <strong>{topic.title}</strong>
                  <ul className="mt-2 space-y-1 text-muted">
                    {topic.standings.map((s) => (
                      <li key={s.nickname}>
                        {s.nickname} — {s.score}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              {yearbook.topics.length === 0 && (
                <p className="text-muted">No award topics yet.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

function SectionHeading({
  children,
  color,
  theme,
}: {
  children: ReactNode
  color: string
  theme: string
}) {
  return (
    <h2
      className={clsx(
        'border-b-2 pb-2 font-display text-2xl tracking-tight',
        theme === 'MINIMAL' && 'text-sm uppercase tracking-[0.12em]',
      )}
      style={{ color, borderColor: color }}
    >
      {children}
    </h2>
  )
}
