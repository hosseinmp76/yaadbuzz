import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'

type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-16 w-16 text-xl',
  lg: 'h-24 w-24 text-3xl',
}

type Props = {
  name: string
  src?: string | null
  size?: Size
  className?: string
  style?: CSSProperties
}

function initialFromName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toLocaleUpperCase()
}

/** Photo avatar, or the first letter of `name` when no image is set. */
export function Avatar({ name, src, size = 'md', className, style }: Props) {
  const initial = initialFromName(name)
  const base = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
    sizes[size],
    className,
  )

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(base, 'object-cover')}
        style={style}
      />
    )
  }

  return (
    <span
      className={cn(base, 'bg-brand font-display font-semibold tracking-tight text-on-brand')}
      style={style}
      aria-hidden
      title={name}
    >
      {initial}
    </span>
  )
}
