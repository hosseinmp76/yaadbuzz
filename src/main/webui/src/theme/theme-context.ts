import { createContext, useContext } from 'react'
import type { ThemeDefinition, ThemeId } from './themes'

export type ThemeContextValue = {
  themeId: ThemeId
  theme: ThemeDefinition
  themes: ThemeDefinition[]
  setThemeId: (id: ThemeId) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('ThemeProvider missing')
  return ctx
}
