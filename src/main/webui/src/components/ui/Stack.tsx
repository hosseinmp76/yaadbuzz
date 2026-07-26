import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { stackClass } from './styles'

export function Stack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(stackClass, className)} {...props} />
}
