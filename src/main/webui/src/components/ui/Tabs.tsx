import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        '-mx-0 my-4 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain px-0.5 pb-1 [scrollbar-width:thin]',
        className,
      )}
      {...props}
    />
  )
}

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function TabButton({ active, className, type = 'button', ...props }: TabButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'shrink-0 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold capitalize transition sm:text-base',
        active
          ? 'border-transparent bg-brand text-on-brand shadow-sm'
          : 'border-line bg-panel-strong text-ink hover:border-brand/30',
        className,
      )}
      {...props}
    />
  )
}
