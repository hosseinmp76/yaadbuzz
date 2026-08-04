import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Input } from './Field'

/** Normalize to #rrggbb for `<input type="color">`; returns null if invalid. */
export function normalizeHexColor(value: string): string | null {
  const raw = value.trim()
  const short = /^#([0-9a-fA-F]{3})$/.exec(raw)
  if (short) {
    const [r, g, b] = short[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  const full = /^#([0-9a-fA-F]{6})$/.exec(raw)
  if (full) return `#${full[1]}`.toLowerCase()
  return null
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange, className, id, ...props }: Props) {
  const pickerValue = normalizeHexColor(value) ?? '#0f766e'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        {...props}
        id={id}
        type="color"
        value={pickerValue}
        aria-label={props['aria-label']}
        className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-line bg-panel-strong p-1 touch-manipulation"
        onChange={(e) => onChange(e.target.value.toLowerCase())}
      />
      <Input
        value={value}
        spellCheck={false}
        autoComplete="off"
        placeholder="#0f766e"
        className="font-mono"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
