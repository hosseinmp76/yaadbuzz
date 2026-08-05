import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from './ui/Button'

const PREVIEWS = [
  '/features/feature-teams.webp',
  '/features/feature-tributes.webp',
  '/features/feature-memories.webp',
] as const

/** Below-fold landing preview strip — lazy-loaded so the hero stays light. */
export default function LandingPreview() {
  const { t } = useTranslation()
  return (
    <section className="border-t border-line py-16" aria-labelledby="preview-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="preview-heading" className="font-display text-3xl tracking-tight text-brand sm:text-4xl">
            {t('landing.previewTitle')}
          </h2>
          <p className="mt-3 max-w-xl text-muted">{t('landing.previewBody')}</p>
        </div>
        <Link to="/features" className="sm:shrink-0">
          <Button variant="secondary">{t('landing.seeFeatures')}</Button>
        </Link>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PREVIEWS.map((src, index) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="overflow-hidden rounded-panel border border-line bg-panel-strong shadow-panel"
          >
            <img
              src={src}
              alt=""
              className="aspect-[16/10] h-auto w-full object-cover object-top"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
