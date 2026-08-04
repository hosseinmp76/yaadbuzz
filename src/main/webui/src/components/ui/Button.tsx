import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-on-brand hover:bg-brand-deep border border-transparent shadow-panel',
  secondary:
    'bg-panel-strong text-ink border border-line hover:bg-panel shadow-sm',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-panel-strong',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold tracking-[-0.01em] transition disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
})
