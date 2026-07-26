import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-on-brand hover:bg-brand-deep border border-transparent shadow-sm',
  secondary:
    'bg-transparent text-ink border border-line hover:bg-panel-strong',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-panel',
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
