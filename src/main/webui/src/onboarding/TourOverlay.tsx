import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'
import type { TourStep } from './tourSteps'
import { tourTargetSelector } from './tourSteps'

type Rect = { top: number; left: number; width: number; height: number }

const PAD = 8
const RADIUS = 12

function measure(target: string): Rect | null {
  const el = document.querySelector(tourTargetSelector(target))
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  }
}

function holePath(rect: Rect, vw: number, vh: number): string {
  const { left: x, top: y, width: w, height: h } = rect
  const r = Math.min(RADIUS, w / 2, h / 2)
  // Outer clockwise, inner counter-clockwise (evenodd cutout)
  return [
    `M0 0H${vw}V${vh}H0Z`,
    `M${x + r} ${y}`,
    `H${x + w - r}`,
    `A${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `V${y + h - r}`,
    `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `H${x + r}`,
    `A${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `V${y + r}`,
    `A${r} ${r} 0 0 1 ${x + r} ${y}`,
    'Z',
  ].join('')
}

type Props = {
  step: TourStep
  stepIndex: number
  stepCount: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

export function TourOverlay({
  step,
  stepIndex,
  stepCount,
  onNext,
  onPrev,
  onSkip,
}: Props) {
  const { t } = useTranslation()
  const nextRef = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight })
  const isLast = stepIndex >= stepCount - 1
  const isFirst = stepIndex <= 0

  useEffect(() => {
    nextRef.current?.focus()
  }, [step.id])

  useLayoutEffect(() => {
    const update = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight })
      setRect(measure(step.target))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [step.target, stepIndex])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onSkip()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        onNext()
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        e.preventDefault()
        onPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNext, onPrev, onSkip, isFirst])

  const tooltipStyle = (() => {
    if (!rect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } as const
    }
    const spaceBelow = window.innerHeight - (rect.top + rect.height)
    const preferBelow = spaceBelow > 180
    const top = preferBelow ? rect.top + rect.height + 12 : Math.max(12, rect.top - 12)
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2),
      window.innerWidth - 16,
    )
    return {
      top,
      left,
      transform: preferBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
    } as const
  })()

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <AnimatePresence mode="wait">
        {rect ? (
          <motion.svg
            key={`mask-${step.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 h-full w-full"
            width={viewport.w}
            height={viewport.h}
          >
            <path
              d={holePath(rect, viewport.w, viewport.h)}
              fill="color-mix(in srgb, var(--ink) 55%, transparent)"
              fillRule="evenodd"
              onClick={onSkip}
            />
            <rect
              x={rect.left}
              y={rect.top}
              width={rect.width}
              height={rect.height}
              rx={RADIUS}
              fill="none"
              stroke="var(--brand)"
              strokeWidth={2}
              pointerEvents="none"
            />
          </motion.svg>
        ) : (
          <div key="dim" className="absolute inset-0 bg-ink/55" onClick={onSkip} aria-hidden />
        )}
      </AnimatePresence>

      <motion.div
        key={`tip-${step.id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className={cn(
          'absolute z-[101] w-[min(22rem,calc(100vw-2rem))] rounded-panel border border-line bg-panel p-4 shadow-panel',
        )}
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold tracking-wide text-muted">
          {t('onboarding.progress', { current: stepIndex + 1, total: stepCount })}
        </p>
        <h2 id="tour-title" className="mt-1 font-display text-xl tracking-tight text-ink">
          {t(step.titleKey)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t(step.bodyKey)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" className="px-3 py-2 text-sm" onClick={onSkip}>
            {t('onboarding.skip')}
          </Button>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="secondary" className="px-3.5 py-2 text-sm" onClick={onPrev}>
                {t('onboarding.back')}
              </Button>
            )}
            <Button ref={nextRef} className="px-3.5 py-2 text-sm" onClick={onNext}>
              {isLast ? t('onboarding.finish') : t('onboarding.next')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
