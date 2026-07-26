import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'

const fieldClass =
  'w-full min-h-11 touch-manipulation rounded-xl border border-line bg-panel-strong px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand'

export function Label({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('mb-3 grid gap-1.5 font-semibold text-ink', className)}>
      {children}
    </label>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, 'min-h-28 resize-y', className)} {...props} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, className)} {...props} />
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-danger">{message}</p>
}
