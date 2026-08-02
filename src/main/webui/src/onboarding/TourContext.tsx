import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { TourContext } from './tourContextValue'
import { buildTourSteps, type TourStep } from './tourSteps'
import {
  clearOnboardingDismissed,
  markOnboardingCompleted,
  resetOnboardingForReplay,
} from './storage'
import { TourOverlay } from './TourOverlay'
import { waitForTarget } from './waitForTarget'

async function resolveIds(): Promise<{
  orgId?: string
  teamId?: string
}> {
  const orgs = await api.myOrganizations()
  const orgId = orgs[0]?.id
  if (!orgId) return {}
  const teams = await api.teams(orgId)
  const teamId = teams[0]?.id
  return { orgId, teamId }
}

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [steps, setSteps] = useState<TourStep[]>([])
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const preparing = useRef(false)

  const stopTour = useCallback((markComplete = true) => {
    preparing.current = false
    setReady(false)
    setSteps([])
    setIndex(0)
    if (markComplete) markOnboardingCompleted()
  }, [])

  const prepareStep = useCallback(
    async (step: TourStep): Promise<boolean> => {
      if (step.path) {
        const search = step.tab ? `?tab=${step.tab}` : ''
        void navigate(`${step.path}${search}`)
      }
      const el = await waitForTarget(step.target)
      return !!el
    },
    [navigate],
  )

  const goToIndex = useCallback(
    async (nextIndex: number, list: TourStep[], direction: 1 | -1) => {
      if (nextIndex < 0) return
      if (nextIndex >= list.length) {
        stopTour(true)
        return
      }
      setReady(false)
      let i = nextIndex
      while (i >= 0 && i < list.length) {
        const candidate = list[i]
        if (!candidate) break
        const ok = await prepareStep(candidate)
        if (ok) {
          setIndex(i)
          setReady(true)
          return
        }
        i += direction
      }
      if (direction === 1) stopTour(true)
      else setReady(true)
    },
    [prepareStep, stopTour],
  )

  const startTour = useCallback(async () => {
    if (preparing.current) return
    preparing.current = true
    resetOnboardingForReplay()
    clearOnboardingDismissed()
    try {
      const ids = await resolveIds()
      const built = buildTourSteps(ids)
      if (built.length === 0) {
        preparing.current = false
        return
      }
      setSteps(built)
      setIndex(0)
      await goToIndex(0, built, 1)
    } finally {
      preparing.current = false
    }
  }, [goToIndex])

  const onNext = useCallback(() => {
    void goToIndex(index + 1, steps, 1)
  }, [goToIndex, index, steps])

  const onPrev = useCallback(() => {
    void goToIndex(index - 1, steps, -1)
  }, [goToIndex, index, steps])

  const onSkip = useCallback(() => {
    stopTour(true)
  }, [stopTour])

  const value = useMemo(
    () => ({
      active: ready && steps.length > 0,
      startTour,
      stopTour,
    }),
    [ready, steps.length, startTour, stopTour],
  )

  const step = steps[index]

  return (
    <TourContext.Provider value={value}>
      {children}
      {ready && step && (
        <TourOverlay
          step={step}
          stepIndex={index}
          stepCount={steps.length}
          onNext={onNext}
          onPrev={onPrev}
          onSkip={onSkip}
        />
      )}
    </TourContext.Provider>
  )
}
