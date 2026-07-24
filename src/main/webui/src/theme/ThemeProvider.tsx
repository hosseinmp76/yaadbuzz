import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeContextValue } from './theme-context'
import {
  THEME_STORAGE_KEY,
  THEMES,
  getTheme,
  type ThemeDefinition,
  type ThemeId,
} from './themes'

function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement
  root.dataset.theme = theme.id
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return getTheme(saved).id
  })

  const theme = useMemo(() => getTheme(themeId), [themeId])

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme.id)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId,
      theme,
      themes: THEMES,
      setThemeId: setThemeIdState,
    }),
    [themeId, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
