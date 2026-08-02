import { createContext } from 'react'

export type TourApi = {
  active: boolean
  startTour: () => Promise<void>
  stopTour: (markComplete?: boolean) => void
}

export const TourContext = createContext<TourApi | null>(null)
