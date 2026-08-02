import { useContext } from 'react'
import { TourContext, type TourApi } from './tourContextValue'

export type { TourApi }

export function useTour(): TourApi {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

export function useTourOptional(): TourApi | null {
  return useContext(TourContext)
}
