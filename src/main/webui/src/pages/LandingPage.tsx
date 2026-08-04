import { BookOpenText, Printer, UsersThree } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { registerWebMcpTools } from '../agent/webmcp'
import { BrandMark } from '../components/BrandMark'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Stack } from '../components/ui/Stack'
import { useAuth } from '../auth'
import { Seo } from '../seo/Seo'

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
      <section className="relative min-h-[calc(100dvh-6rem)] overflow-hidden pb-12 pt-6 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-2xl md:max-w-[min(42rem,46%)]"
        >
          <h1 className="font-display text-[clamp(2.75rem,12vw,6.2rem)] leading-[0.92] tracking-[-0.05em]">
            <BrandMark />
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:mt-5 sm:text-lg">{t('landing.hero')}</p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
            {user ? (
              <Link to="/app" className="sm:w-auto">
                <Button className="w-full sm:w-auto">{t('landing.openDashboard')}</Button>
              </Link>
            ) : (
              <Link to="/register" className="sm:w-auto">
                <Button className="w-full sm:w-auto">{t('landing.startYearbook')}</Button>
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="pointer-events-none absolute inset-y-8 end-[-8%] hidden w-[48%] rounded-[2rem] border border-line bg-panel shadow-panel md:block"
          style={{
            background:
              'linear-gradient(145deg, color-mix(in oklab, var(--brand) 18%, transparent), transparent 55%), var(--panel-strong)',
          }}
        >
          <div className="absolute start-10 top-12 flex items-center gap-3 text-brand">
            <UsersThree size={36} weight="duotone" />
            <span className="font-display text-2xl tracking-tight">{t('landing.visualTeams')}</span>
          </div>
          <div className="absolute bottom-14 start-10 flex items-center gap-3 text-accent">
            <BookOpenText size={36} weight="duotone" />
            <span className="font-display text-2xl tracking-tight">{t('landing.visualYearbooks')}</span>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-line py-14" aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-display text-3xl tracking-tight sm:text-4xl">
          {t('landing.howTitle')}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">{t('landing.howSubtitle')}</p>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          <li>
            <Stack>
              <UsersThree size={28} weight="duotone" className="text-brand" aria-hidden />
              <h3 className="font-display text-xl tracking-tight">{t('landing.step1Title')}</h3>
              <p className="text-muted">{t('landing.step1Body')}</p>
            </Stack>
          </li>
          <li>
            <Stack>
              <BookOpenText size={28} weight="duotone" className="text-brand" aria-hidden />
              <h3 className="font-display text-xl tracking-tight">{t('landing.step2Title')}</h3>
              <p className="text-muted">{t('landing.step2Body')}</p>
            </Stack>
          </li>
          <li>
            <Stack>
              <Printer size={28} weight="duotone" className="text-accent" aria-hidden />
              <h3 className="font-display text-xl tracking-tight">{t('landing.step3Title')}</h3>
              <p className="text-muted">{t('landing.step3Body')}</p>
            </Stack>
          </li>
        </ol>
        <p className="mt-10 text-muted">
          {t('landing.curious')}{' '}
          <Link to="/about" className="font-semibold text-brand underline-offset-2 hover:underline">
            {t('landing.readStory')}
          </Link>
          .
        </p>
      </section>
    </Layout>
  )
}
