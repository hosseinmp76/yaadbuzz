import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { pageTitleClass } from './styles'

export function PageTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn(pageTitleClass, className)} {...props} />
}
