import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { chipClass } from './styles'

export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(chipClass, className)} {...props} />
}
