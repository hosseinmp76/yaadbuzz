import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'

type Size = 'sm' | 'md' | 'lg' | 'xl'
type Shape = 'circle' | 'rounded'

const sizes: Record<Size, string> = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-xl',
  lg: 'h-24 w-24 text-3xl',
  xl: 'h-36 w-36 text-5xl sm:h-44 sm:w-44 sm:text-6xl',
}

const shapes: Record<Shape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-3xl',
}

type Props = {
  name: string
  src?: string | null
  size?: Size
  shape?: Shape
  className?: string
  style?: CSSProperties
}

function initialFromName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toLocaleUpperCase()
}

/** Photo avatar, or the first letter of `name` when no image is set. */
export function Avatar({ name, src, size = 'md', shape = 'circle', className, style }: Props) {
  const initial = initialFromName(name)
  const base = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden',
    shapes[shape],
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
