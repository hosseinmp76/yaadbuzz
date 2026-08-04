import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth'
import { BrandMark } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import Layout, { AccountMenu } from './Layout'
import { Button } from './ui/Button'
import { cn } from '../lib/cn'

/** Brand + scrollable nav + account chrome for edge-attached sidebars. */
export function AppSidebarChrome({
  subtitle,
  children,
}: {
  subtitle?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <>
      <div className="flex flex-col gap-1 border-b border-line py-5 pe-1 ps-1">
        <Link
          to="/"
          className="font-display text-[1.45rem] tracking-[-0.03em] text-brand"
          aria-label={t('brand.homeAria')}
        >
          <BrandMark />
        </Link>
        {subtitle && (
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-4 pe-1 ps-1">{children}</div>
      <div className="mt-auto space-y-3 border-t border-line py-4 pe-1 ps-1">
        <LanguageSwitcher />
        {user ? (
          <AccountMenu displayName={user.displayName} menuPlacement="top" />
        ) : (
          <Link to="/login">
            <Button className="w-full px-4 text-sm">{t('nav.login')}</Button>
          </Link>
        )}
      </div>
    </>
  )
}

export function sidebarNavClass(stacked: boolean) {
  return stacked
    ? 'flex flex-col gap-1'
    : '-mx-0.5 flex gap-1.5 overflow-x-auto overscroll-x-contain px-0.5 pb-0.5 [scrollbar-width:thin]'
}

export function sidebarItemClass(active: boolean, stacked: boolean) {
  return cn(
    'inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition',
    stacked && 'w-full',
    active
      ? 'bg-brand text-on-brand shadow-sm'
      : 'text-ink hover:bg-[color-mix(in_oklab,var(--brand)_8%,transparent)]',
  )
}

export function SidebarNavLink({
  to,
  active,
  icon: Icon,
  stacked,
  children,
  ...rest
}: {
  to: string
  active?: boolean
  icon: Icon
  stacked: boolean
  children: ReactNode
  'data-tour'?: string
}) {
  return (
    <Link to={to} className={sidebarItemClass(!!active, stacked)} {...rest}>
      <Icon size={20} weight={active ? 'fill' : 'duotone'} className="shrink-0" />
      <span className="truncate whitespace-nowrap">{children}</span>
    </Link>
  )
}

export function SidebarNavButton({
  active,
  icon: Icon,
  stacked,
  children,
  ...rest
}: {
  active?: boolean
  icon: Icon
  stacked: boolean
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  'data-tour'?: string
}) {
  return (
    <button type="button" className={sidebarItemClass(!!active, stacked)} {...rest}>
      <Icon size={20} weight={active ? 'fill' : 'duotone'} className="shrink-0" />
      <span className="truncate whitespace-nowrap">{children}</span>
    </button>
  )
}

/** Authenticated pages with the same edge-attached sidebar shell as Team. */
export function AppSidebarLayout({
  subtitle,
  nav,
  mobileNav,
  children,
}: {
  subtitle?: string
  nav: ReactNode
  mobileNav?: ReactNode
  children: ReactNode
}) {
  return (
    <Layout
      sidebar={<AppSidebarChrome subtitle={subtitle}>{nav}</AppSidebarChrome>}
      mobileNav={mobileNav}
    >
      {children}
    </Layout>
  )
}
