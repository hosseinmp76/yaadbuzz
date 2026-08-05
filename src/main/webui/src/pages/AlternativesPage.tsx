import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import Layout from '../components/Layout'
import { Seo } from '../seo/Seo'

type Alternative = {
  name: string
  url: string
  features: string[]
}

/** Ordered by similarity to Yaadbuzz (collaborative team/school yearbook, online-first). */
const ALTERNATIVES: Alternative[] = [
  {
    name: 'YearBoxx',
    url: 'https://yearboxx.com/',
    features: [
      'Digital-first interactive school yearbook for phones',
      'Photos, videos, and drag-and-drop YearBoxx Create tools',
      'Personalized MY PAGE per student with text/video signatures',
      'Staff collaboration; publish without traditional print deadlines',
      'Lifetime digital access; can complement a printed book',
    ],
  },
  {
    name: 'TreeRing',
    url: 'https://www.treering.com/',
    features: [
      'Free collaborative school yearbook design software',
      'Portrait auto-flow, themes, and drag-and-drop layouts',
      'Many editor accounts per school; photo sharing folders',
      'Two free personalized custom pages per student copy',
      'Digital signatures; print + ship with no order minimums',
    ],
  },
  {
    name: 'Entourage Yearbooks',
    url: 'https://www.entourageyearbooks.com/',
    features: [
      'EDONext cloud yearbook designer (computer and tablet)',
      'Page ladder, assignments, due dates, and role permissions',
      'Templates, Book Builder themes, and AI layout assist',
      'Import from Google Docs/Slides/Drive and social sources',
      'Team chat and parallel editing with advisor guardrails',
    ],
  },
  {
    name: 'Mixbook',
    url: 'https://www.mixbook.com/',
    features: [
      'Mixbook Studio™ themes and recommended layouts',
      'Invite collaborators to view, edit, or order copies',
      'Auto-create / Story Mode AI photo-book layouts',
      'School yearbook program with softcover and hardcover',
      'One active editor at a time on a shared project',
    ],
  },
  {
    name: 'Storyworth Celebrations',
    url: 'https://welcome.storyworth.com/celebrate',
    features: [
      'Invite many people to contribute stories and photos',
      'Email invitations, shareable links, and QR codes',
      'Automated contribution reminders toward a due date',
      'Auto-laid-out hardcover (6×9″); color or B&W interior',
      'Free to collect content; pay only when ordering books',
    ],
  },
  {
    name: 'Keepsake',
    url: 'https://www.keepsakeproject.co/',
    features: [
      'Real-time collaborative memory-book editor',
      'Guided prompts, chapters, photos, and comments/@mentions',
      'Roles (owner/admin/editor/viewer) and activity feeds',
      'Unlimited collaborators on a project',
      'Professionally printed hardcover keepsakes',
    ],
  },
  {
    name: 'OnceUpon',
    url: 'https://onceupon.photo/',
    features: [
      'Mobile-first photo books with autofill layouts',
      'Co-create: invite friends/family via link or QR to add photos',
      'iOS, Android, and web editors',
      'Hardcover/softcover formats; silk or semi-gloss paper',
      'Year-in-review books you can build bit by bit',
    ],
  },
  {
    name: 'COLLAB (Bookfactory)',
    url: 'https://www.bookfactory.ch/collab/',
    features: [
      'Smartphone app to pool everyone’s event photos',
      'Invite via share link; guests can web-upload without the app',
      'AI/algorithm selects best shots, drops duplicates, suggests layout',
      'Team designs a print photo book (Swiss Bookfactory printing)',
      'Built for trips, weddings, and group events—not school ladders',
    ],
  },
  {
    name: 'Everlasting',
    url: 'https://everlastingapp.com/',
    features: [
      'Private digital event space (photos, videos, tributes, comments)',
      'Guests join via QR—no account required',
      'Themed albums with optional upload moderation',
      'Invites, timeline feed, and real-time sync across devices',
      'Download media or order printed keepsakes / QR medallions',
    ],
  },
  {
    name: 'Chatbooks',
    url: 'https://www.chatbooks.com/',
    features: [
      'Phone-first Monthbooks subscription (print on a cadence)',
      'Dedicated Yearbook builder (up to 366 pages)',
      'Import from camera roll, Google Photos, or Monthbook photos',
      '1-up or 4-up collage layouts; softcover and hardcover sizes',
      'Free standard shipping; focused on family photo printing',
    ],
  },
  {
    name: 'Canva',
    url: 'https://www.canva.com/',
    features: [
      'Drag-and-drop yearbook and photo-book templates',
      'Real-time team collaboration via shared designs',
      'Huge library of fonts, stock media, and brand kits',
      'Export PDF or order prints through Canva Print',
      'Free for education; general design tool, not school-yearbook workflow',
    ],
  },
]

export default function AlternativesPage() {
  const { t } = useTranslation()

  return (
    <Layout>
      <Seo
        title={t('alternatives.seoTitle')}
        description={t('alternatives.seoDescription')}
        path="/alternatives"
      />

      <section className="max-w-2xl pb-10 pt-6 sm:pt-10">
        <p className="text-sm font-semibold tracking-[0.08em] uppercase text-muted">
          {t('alternatives.eyebrow')}
        </p>
        <h1 className="mt-2 font-display text-[clamp(2.4rem,8vw,3.8rem)] leading-[0.95] tracking-[-0.04em] text-brand">
          <BrandMark />
        </h1>
        <p className="mt-4 text-lg text-muted">{t('alternatives.lead')}</p>
        <p className="mt-3 text-muted">{t('alternatives.intro')}</p>
      </section>

      <ul className="mb-12 grid gap-4">
        {ALTERNATIVES.map((item) => (
          <li
            key={item.url}
            className="rounded-panel border border-line bg-panel-strong p-5 shadow-sm sm:p-6"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-xl tracking-tight text-brand hover:underline"
            >
              {item.name}
            </a>
            <p className="mt-1 truncate text-sm text-muted">{item.url}</p>
            <ul className="mt-4 list-disc space-y-1.5 ps-5 text-sm text-ink/90">
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <p className="text-muted">
        {t('alternatives.backHome')}{' '}
        <Link to="/" className="font-semibold text-brand underline-offset-2 hover:underline">
          {t('alternatives.homeLink')}
        </Link>
      </p>
    </Layout>
  )
}
