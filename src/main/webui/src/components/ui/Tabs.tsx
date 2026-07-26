import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        '-mx-1 my-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]',
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
        'shrink-0 rounded-full border px-3.5 py-2.5 text-sm font-semibold capitalize transition sm:text-base',
        active
          ? 'border-transparent bg-brand text-on-brand'
          : 'border-line bg-transparent text-ink hover:bg-panel',
        className,
      )}
      {...props}
    />
  )
}
