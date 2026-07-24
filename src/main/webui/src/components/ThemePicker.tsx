import { Check, Palette } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useTheme } from '../theme/ThemeProvider'
import type { ThemeId } from '../theme/themes'

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { themeId, themes, setThemeId } = useTheme()

  return (
    <section className={clsx('stack', compact && 'min-w-64')}>
      <div className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Palette size={18} weight="duotone" />
        Theme
      </div>
      <div className={clsx('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3')}>
        {themes.map((theme) => {
          const active = theme.id === themeId
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setThemeId(theme.id as ThemeId)}
              className={clsx(
                'rounded-[14px] border p-3 text-left transition',
                active
                  ? 'border-brand bg-panel-strong shadow-panel'
                  : 'border-line bg-panel hover:border-brand/40',
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-ink">{theme.label}</span>
                {active && <Check size={16} className="text-brand" weight="bold" />}
              </div>
              <div className="mb-2 flex gap-1.5">
                {theme.preview.map((color) => (
                  <span
                    key={color}
                    className="h-4 w-4 rounded-full border border-line"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted">{theme.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
