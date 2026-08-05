import { BookOpenText, Printer, UsersThree } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { registerWebMcpTools } from '../agent/webmcp'
import { BrandMark } from '../components/BrandMark'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Stack } from '../components/ui/Stack'
import { useAuth } from '../auth'
import { Seo } from '../seo/Seo'

const MotionPreview = lazy(() => import('../components/LandingPreview'))

const HERO_IMAGE = '/features/feature-yearbook.webp'

export default function LandingPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  useEffect(() => {
    registerWebMcpTools()
  }, [])
  return (
    <Layout>
      <Seo
        title={t('landing.seoTitle')}
        description={t('landing.seoDescription')}
        path="/"
      />

      <section className="relative -mx-4 min-h-[min(70dvh,36rem)] overflow-hidden sm:-mx-6 sm:min-h-[calc(100dvh-7rem)]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[color-mix(in_oklab,var(--brand-deep)_85%,#0a2e2c)]"
        />
        <motion.img
          src={HERO_IMAGE}
          alt=""
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--brand-deep)_90%,black)] via-[color-mix(in_oklab,var(--brand-deep)_45%,transparent)] to-[color-mix(in_oklab,var(--brand)_20%,transparent)]"
        />
        <div className="relative z-10 flex min-h-[min(70dvh,36rem)] flex-col justify-end px-4 pb-12 pt-16 sm:min-h-[calc(100dvh-7rem)] sm:px-6 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-white"
          >
            <h1 className="font-display text-[clamp(3rem,12vw,6.4rem)] leading-[0.9] tracking-[-0.05em] text-white">
              <BrandMark className="text-white [&_span]:text-white" />
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/90 sm:mt-6 sm:text-xl">
              {t('landing.hero')}
            </p>
            <p className="mt-2 max-w-xl text-base text-white/80 sm:text-lg">{t('landing.heroFoss')}</p>
            <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">{t('landing.heroMeaning')}</p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              {user ? (
                <Link to="/app" className="sm:w-auto">
                  <Button
                    variant="secondary"
                    className="w-full border-white/35 bg-white/10 text-white hover:bg-white/18 sm:w-auto"
                  >
                    {t('landing.openDashboard')}
                  </Button>
                </Link>
              ) : (
                <Link to="/register" className="sm:w-auto">
                  <Button
                    variant="secondary"
                    className="w-full border-white/35 bg-white/10 text-white hover:bg-white/18 sm:w-auto"
                  >
                    {t('landing.startYearbook')}
                  </Button>
                </Link>
              )}
              <Link to="/features" className="sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full border-white/35 bg-white/10 text-white hover:bg-white/18 sm:w-auto"
                >
                  {t('landing.seeFeatures')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-line py-16" aria-labelledby="how-heading">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="how-heading" className="font-display text-3xl tracking-tight text-brand sm:text-4xl">
            {t('landing.howTitle')}
          </h2>
          <p className="mt-3 max-w-2xl text-muted">{t('landing.howSubtitle')}</p>
        </motion.div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { icon: UsersThree, title: 'step1Title', body: 'step1Body' },
            { icon: BookOpenText, title: 'step2Title', body: 'step2Body' },
            { icon: Printer, title: 'step3Title', body: 'step3Body' },
          ].map(({ icon: Icon, title, body }, index) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-panel border border-line bg-panel-strong p-6 shadow-panel"
            >
              <Stack>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-brand">
                  <Icon size={24} weight="duotone" aria-hidden />
                </div>
                <h3 className="font-display text-xl tracking-tight text-brand">
                  {t(`landing.${title}`)}
                </h3>
                <p className="text-muted">{t(`landing.${body}`)}</p>
              </Stack>
            </motion.li>
          ))}
        </ol>
        <p className="mt-12 text-muted">
          {t('landing.curious')}{' '}
          <Link to="/about" className="font-semibold text-brand underline-offset-2 hover:underline">
            {t('landing.readStory')}
          </Link>
          .
        </p>
      </section>

      <Suspense fallback={null}>
        <MotionPreview />
      </Suspense>
    </Layout>
  )
}
