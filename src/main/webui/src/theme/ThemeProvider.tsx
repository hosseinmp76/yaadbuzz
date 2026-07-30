import { useEffect, useMemo, useState, type ReactNode } from 'react'
import i18n, { applyDocumentLanguage } from '../i18n'
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
  // Re-apply language fonts after theme colors (themes must not own typography).
  applyDocumentLanguage(i18n.language)
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
