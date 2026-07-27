import { ArrowUpRight } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Seo } from '../seo/Seo'

const DEFAULT_SOURCE = 'https://github.com/hosseinmp76/yaadbuzz'

export default function SourcePage() {
  const { t } = useTranslation()
  const sourceUrl = (import.meta.env.VITE_SOURCE_URL as string | undefined) || DEFAULT_SOURCE

  return (
    <Layout>
      <Seo title={t('source.seoTitle')} path="/source" />
      <section className="max-w-2xl pb-8 pt-6 sm:pt-10">
        <h1 className="font-display text-[clamp(2.2rem,7vw,3.4rem)] leading-[0.95] tracking-[-0.04em]">
          {t('source.title')}
        </h1>
        <p className="mt-4 text-lg text-muted leading-relaxed">{t('source.body')}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={sourceUrl} rel="noopener noreferrer" target="_blank">
            <Button className="w-full sm:w-auto">
              {t('source.repo')}
              <ArrowUpRight size={18} />
            </Button>
          </a>
          <a href="/LICENSE.txt">
            <Button variant="secondary" className="w-full sm:w-auto">
              {t('source.license')}
            </Button>
          </a>
          <a href="/api/source">
            <Button variant="ghost" className="w-full sm:w-auto">
              {t('source.api')}
            </Button>
          </a>
        </div>
      </section>
    </Layout>
  )
}
