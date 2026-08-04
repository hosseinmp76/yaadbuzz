import { ArrowUpRight, FilePdf } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth'
import { cn } from '../lib/cn'
import { Seo } from '../seo/Seo'

const EXAMPLE_PDF = '/features/yaadbuzz-example.pdf'

const FEATURES = [
  {
    key: 'teams',
    image: '/features/feature-teams.webp',
  },
  {
    key: 'tributes',
    image: '/features/feature-tributes.webp',
  },
  {
    key: 'memories',
    image: '/features/feature-memories.webp',
  },
  {
    key: 'awards',
    image: '/features/feature-awards.webp',
  },
  {
    key: 'yearbook',
    image: '/features/feature-yearbook.webp',
  },
] as const

export default function FeaturesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Layout>
      <Seo
        title={t('features.seoTitle')}
        description={t('features.seoDescription')}
        path="/features"
      />

      <section className="max-w-2xl pb-10 pt-6 sm:pt-10">
        <p className="text-sm font-semibold tracking-[0.08em] uppercase text-muted">
          {t('features.eyebrow')}
        </p>
        <h1 className="mt-2 font-display text-[clamp(2.4rem,8vw,3.8rem)] leading-[0.95] tracking-[-0.04em] text-brand">
          <BrandMark />
        </h1>
        <p className="mt-4 text-lg text-muted">{t('features.lead')}</p>
        <div className="mt-6">
          <a href={EXAMPLE_PDF} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" className="w-full sm:w-auto">
              <FilePdf size={18} weight="duotone" />
              {t('features.examplePdf')}
              <ArrowUpRight size={18} />
            </Button>
          </a>
        </div>
      </section>

      <div className="space-y-16 pb-8 sm:space-y-24 sm:pb-12">
        {FEATURES.map((feature, index) => {
          const reverse = index % 2 === 1
          return (
            <motion.section
              key={feature.key}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'grid items-center gap-8 lg:grid-cols-2 lg:gap-12',
                reverse && 'lg:[&>*:first-child]:order-2',
              )}
              aria-labelledby={`feature-${feature.key}`}
            >
              <div className="overflow-hidden rounded-panel border border-line bg-panel-strong shadow-panel">
                <img
                  src={feature.image}
                  alt=""
                  className="block aspect-[16/10] h-auto w-full object-cover object-top"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
              <div className="max-w-lg">
                <h2
                  id={`feature-${feature.key}`}
                  className="font-display text-2xl tracking-tight text-brand sm:text-3xl"
                >
                  {t(`features.items.${feature.key}.title`)}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
                  {t(`features.items.${feature.key}.body`)}
                </p>
                {feature.key === 'yearbook' && (
                  <a
                    href={EXAMPLE_PDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-brand underline-offset-2 hover:underline"
                  >
                    <FilePdf size={20} weight="duotone" />
                    {t('features.examplePdf')}
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </motion.section>
          )
        })}
      </div>

      <section className="border-t border-line py-12">
        <h2 className="font-display text-2xl tracking-tight text-brand sm:text-3xl">
          {t('features.ctaTitle')}
        </h2>
        <p className="mt-3 max-w-xl text-muted">{t('features.ctaBody')}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {user ? (
            <Link to="/app" className="sm:w-auto">
              <Button className="w-full sm:w-auto">{t('features.openDashboard')}</Button>
            </Link>
          ) : (
            <Link to="/register" className="sm:w-auto">
              <Button className="w-full sm:w-auto">{t('features.startYearbook')}</Button>
            </Link>
          )}
          <Link to="/about" className="sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              {t('features.readStory')}
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
