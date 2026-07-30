import { ArrowUpRight } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Seo } from '../seo/Seo'
import { SITE_URL } from '../seo/site'

const X_URL = 'https://x.com/yaadbuzz_ir'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <Layout>
      <Seo
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        path="/about"
      />

      <section className="max-w-2xl pb-8 pt-6 sm:pt-10">
        <p className="text-sm font-semibold tracking-[0.08em] uppercase text-muted">
          {t('about.eyebrow')}
        </p>
        <h1 className="mt-2 font-display text-[clamp(2.4rem,8vw,3.8rem)] leading-[0.95] tracking-[-0.04em]">
          <BrandMark />
        </h1>
        <p className="mt-4 text-lg text-muted">{t('about.lead')}</p>
      </section>

      <article className="max-w-2xl space-y-6 border-t border-line py-10 text-base leading-relaxed text-ink sm:text-lg">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{t('about.storyTitle')}</h2>
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p>
          {t('about.p3Before')}{' '}
          <a
            href="/LICENSE.txt"
            className="font-semibold text-brand underline-offset-2 hover:underline"
          >
            {t('about.p3License')}
          </a>
          {t('about.p3After')}
        </p>
      </article>

      <section className="max-w-2xl space-y-4 border-t border-line py-10" aria-labelledby="license-heading">
        <h2 id="license-heading" className="font-display text-2xl tracking-tight">
          {t('about.licenseTitle')}
        </h2>
        <p className="text-muted leading-relaxed">
          {t('about.licenseBodyBefore')}{' '}
          <strong className="text-ink">{t('about.licenseStrong')}</strong>{' '}
          {t('about.licenseBodyAfter')}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href="/LICENSE.txt">
            <Button variant="secondary" className="w-full sm:w-auto">
              {t('about.readLicense')}
            </Button>
          </a>
          <Link to="/source">
            <Button variant="secondary" className="w-full sm:w-auto">
              {t('about.correspondingSource')}
            </Button>
          </Link>
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Button variant="ghost" className="w-full sm:w-auto">
              {t('about.agplGnu')}
              <ArrowUpRight size={18} />
            </Button>
          </a>
        </div>
      </section>

      <section className="max-w-2xl space-y-4 border-t border-line py-10">
        <h2 className="font-display text-2xl tracking-tight">{t('about.followTitle')}</h2>
        <p className="text-muted">
          {t('about.followBodyBefore')}{' '}
          <a
            href={X_URL}
            className="font-semibold text-brand underline-offset-2 hover:underline"
            rel="noopener noreferrer me"
            target="_blank"
          >
            @yaadbuzz_ir
          </a>
          {t('about.followBodyAfter')}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={X_URL} rel="noopener noreferrer me" target="_blank">
            <Button variant="secondary" className="w-full sm:w-auto">
              {t('about.onX')}
              <ArrowUpRight size={18} />
            </Button>
          </a>
          <Link to="/register">
            <Button className="w-full sm:w-auto">{t('about.startYearbook')}</Button>
          </Link>
        </div>
        <p className="pt-2 text-sm text-muted">
          {t('about.site')}{' '}
          <a href={SITE_URL} className="font-semibold text-ink hover:text-brand">
            yaadbuzz.ir
          </a>
        </p>
      </section>
    </Layout>
  )
}
