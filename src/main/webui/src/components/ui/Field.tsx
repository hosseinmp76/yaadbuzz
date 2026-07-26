import clsx from 'clsx'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

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
    <label className={clsx('mb-3 grid gap-1.5 font-semibold text-ink', className)}>
      {children}
    </label>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldClass, className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(fieldClass, 'min-h-28 resize-y', className)} {...props} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(fieldClass, className)} {...props} />
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-danger">{message}</p>
}
