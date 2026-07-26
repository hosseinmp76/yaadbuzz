import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { panelClass } from './styles'

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(panelClass, className)} {...props} />
}
