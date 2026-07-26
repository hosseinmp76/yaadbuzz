import { Link, type LinkProps } from 'react-router-dom'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { listItemClass } from './styles'

export function ListItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(listItemClass, className)} {...props} />
}

export function ListItemLink({ className, ...props }: LinkProps) {
  return <Link className={cn(listItemClass, className)} {...props} />
}
