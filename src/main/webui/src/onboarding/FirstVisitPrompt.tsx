import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import {
  isOnboardingCompleted,
  isOnboardingDismissed,
  markOnboardingDismissed,
} from './storage'
import { useTour } from './useTour'

export function FirstVisitPrompt() {
  const { t } = useTranslation()
  const { active, startTour } = useTour()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (active) {
      setOpen(false)
      return
    }
    if (!isOnboardingCompleted() && !isOnboardingDismissed()) {
      setOpen(true)
    }
  }, [active])

  if (!open || active) return null

  const dismiss = () => {
    markOnboardingDismissed()
    setOpen(false)
  }

  const start = () => {
    setOpen(false)
    void startTour()
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50" onClick={dismiss} aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-[91] w-[min(24rem,100%)] rounded-panel border border-line bg-panel p-5 shadow-panel sm:p-6"
      >
        <p className="text-xs font-semibold tracking-wide text-brand">{t('onboarding.prompt.eyebrow')}</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight text-ink">
          {t('onboarding.prompt.title')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t('onboarding.prompt.body')}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={dismiss}>
            {t('onboarding.prompt.notNow')}
          </Button>
          <Button onClick={start}>{t('onboarding.prompt.start')}</Button>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
