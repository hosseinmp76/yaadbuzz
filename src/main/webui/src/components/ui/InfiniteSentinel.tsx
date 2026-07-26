import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const InfiniteSentinel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function InfiniteSentinel({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('py-3 text-center text-sm text-muted', className)}
        {...props}
      />
    )
  },
)
