import { Printer, ArrowLeft } from '@phosphor-icons/react'
import clsx from 'clsx'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect } from 'react'
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

/** Mix a hex color with white for chip backgrounds (print-safe, no color-mix). */
function tint(hex: string, whiteRatio = 0.82): string {
  const raw = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return '#ecfdf5'
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * whiteRatio)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function darken(hex: string, amount = 0.35): string {
  const raw = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return '#134e4a'
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  const mix = (c: number) => Math.round(c * (1 - amount))
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

export default function YearbookPage() {
  const { teamId = '' } = useParams()
  const [{ data, fetching, error }, reexecute] = useQuery({
    query: YEARBOOK,
    variables: { teamId },
    pause: !teamId,
    requestPolicy: 'network-only',
  })
  const yearbook = data?.yearbook as YearbookData | undefined

  useEffect(() => {
    if (!teamId) return
    reexecute({ requestPolicy: 'network-only' })
  }, [teamId, reexecute])

  return (
    <div className="yearbook-print-root min-h-screen bg-[#faf7f2] text-[#1c1917]">
      <div className="print:hidden mx-auto flex w-[min(1100px,calc(100%-1.25rem))] flex-col gap-3 py-4 sm:w-[min(1100px,calc(100%-2rem))] sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={`/teams/${teamId}?tab=yearbook`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#57534e] hover:text-[#1c1917]"
        >
          <ArrowLeft size={18} />
          Back to team
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link to={`/teams/${teamId}?tab=yearbook`} className="sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Customize
            </Button>
          </Link>
          <Button className="w-full sm:w-auto" onClick={() => window.print()}>
            <Printer size={18} />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {fetching && (
        <p className="mx-auto w-[min(800px,calc(100%-2rem))] text-[#57534e]">Loading yearbook…</p>
      )}
      {error && (
        <p className="mx-auto w-[min(800px,calc(100%-2rem))] text-[#b91c1c]">{error.message}</p>
      )}
      {yearbook && <YearbookDocument yearbook={yearbook} />}
    </div>
  )
}

function YearbookDocument({ yearbook }: { yearbook: YearbookData }) {
  const theme = yearbook.theme || 'CLASSIC'
  const brand = yearbook.brandColor || '#0F766E'
  const brandDeep = darken(brand)
  const chipBg = tint(brand)
  const branded = theme === 'CLASSIC' || theme === 'MODERN'

  return (
    <article
      className={clsx(
        'yearbook-doc mx-auto mb-16 w-[min(800px,calc(100%-2rem))] overflow-hidden bg-white shadow-panel print:mb-0 print:w-full print:max-w-none print:shadow-none',
        theme === 'CLASSIC' && 'font-display',
        theme === 'MODERN' && 'font-body',
        theme === 'SCRAPBOOK' && 'font-display',
        theme === 'MINIMAL' && 'font-body',
        `yearbook-theme-${theme}`,
      )}
      style={
        {
          '--yb-brand': brand,
          '--yb-brand-deep': brandDeep,
          color: '#1c1917',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        } as CSSProperties
      }
    >
      <section
        className={clsx(
          'yearbook-cover flex min-h-[60vh] flex-col items-center justify-center px-5 py-12 text-center sm:min-h-[70vh] sm:px-8 sm:py-16 print:min-h-[100vh]',
          branded && 'yearbook-cover--branded',
          theme === 'SCRAPBOOK' && 'yearbook-cover--scrapbook',
          theme === 'MINIMAL' && 'yearbook-cover--minimal',
        )}
        style={
          branded
            ? {
                backgroundColor: brand,
                backgroundImage: `linear-gradient(160deg, ${brand} 0%, ${brandDeep} 70%)`,
                color: '#ffffff',
              }
            : {
                backgroundColor: theme === 'SCRAPBOOK' ? '#faf7f2' : '#ffffff',
                borderColor: brand,
                color: '#1c1917',
              }
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
        <h1 className="font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-tight tracking-[-0.03em] text-current">
          {yearbook.title}
        </h1>
        <p className="mt-3 text-base text-current sm:text-xl">{yearbook.subtitle}</p>
        {yearbook.dedication && (
          <p className="mt-8 max-w-md text-base italic leading-relaxed text-current">
            {yearbook.dedication}
          </p>
        )}
        <p className="mt-10 text-sm tracking-[0.2em] uppercase text-current">Yaadbuzz</p>
      </section>

      <div className="yearbook-body space-y-10 bg-white px-4 py-8 print:px-0 sm:px-10 sm:py-10">
        {yearbook.showMembers && (
          <section>
            <SectionHeading color={brand} theme={theme}>
              Members
            </SectionHeading>
            <div className="mt-5 space-y-8">
              {yearbook.members.map((member) => (
                <div
                  key={member.nickname}
                  className={clsx(
                    'yearbook-block',
                    theme === 'SCRAPBOOK' &&
                      'rounded-xl border border-[#e7e5e4] bg-[#fffdf8] p-4',
                  )}
                >
                  <div className="flex items-start gap-4">
                    {member.avatarUrl && (
                      <img
                        src={member.avatarUrl}
                        alt=""
                        className="h-16 w-16 rounded-full object-cover"
                        style={{ border: `2px solid ${brand}` }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-2xl tracking-tight text-[#1c1917]">
                        {member.nickname}
                      </h3>
                      {member.bio && <p className="mt-1 text-[#57534e]">{member.bio}</p>}
                      {yearbook.showCharacteristics && member.characteristics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.characteristics.map((c) => (
                            <span
                              key={c.title}
                              className="rounded-md px-2 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor: chipBg,
                                color: brand,
                                border: `1px solid ${brand}`,
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
                        className="mt-3 px-3 py-2"
                        style={{
                          borderLeft: `4px solid ${brand}`,
                          backgroundColor: theme === 'MODERN' ? '#f1f5f9' : '#f5f5f4',
                        }}
                      >
                        <p className="whitespace-pre-wrap text-[#1c1917]">{t.text}</p>
                        <footer className="mt-1 text-sm text-[#57534e]">— {t.writer}</footer>
                      </blockquote>
                    ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {yearbook.showMemories && (
          <section>
            <SectionHeading color={brand} theme={theme}>
              Memories
            </SectionHeading>
            <div className="mt-5 space-y-5">
              {yearbook.memories.map((memory, idx) => (
                <article key={idx} className="yearbook-block">
                  {memory.title && (
                    <strong className="text-lg text-[#1c1917]">{memory.title}</strong>
                  )}
                  <p className="mt-1 whitespace-pre-wrap text-[#1c1917]">{memory.body}</p>
                  <p className="mt-2 text-sm text-[#57534e]">— {memory.writer}</p>
                </article>
              ))}
              {yearbook.memories.length === 0 && (
                <p className="text-[#57534e]">No shared memories yet.</p>
              )}
            </div>
          </section>
        )}

        {yearbook.showAwards && (
          <section>
            <SectionHeading color={brand} theme={theme}>
              Awards
            </SectionHeading>
            <div className="mt-5 space-y-4">
              {yearbook.topics.map((topic) => (
                <article key={topic.title} className="yearbook-block">
                  <strong className="text-[#1c1917]">{topic.title}</strong>
                  <ul className="mt-2 space-y-1 text-[#57534e]">
                    {topic.standings.map((s) => (
                      <li key={s.nickname}>
                        {s.nickname} — {s.score}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              {yearbook.topics.length === 0 && (
                <p className="text-[#57534e]">No award topics yet.</p>
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
