import { CaretDown, MapTrifold, SignOut, UserCircle } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth'
import { useTourOptional } from '../onboarding/useTour'
import { BrandMark } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SiteFooter } from './SiteFooter'
import { Button } from './ui/Button'
import { appShellClass } from './ui/styles'
import { cn } from '../lib/cn'

type LayoutProps = {
  children: ReactNode
  /** Full-height nav flush to the viewport start edge (desktop). */
  sidebar?: ReactNode
  /** Compact nav shown above main content on small screens when `sidebar` is set. */
  mobileNav?: ReactNode
}

export default function Layout({ children, sidebar, mobileNav }: LayoutProps) {
  const { user } = useAuth()
  const { t } = useTranslation()

  if (sidebar) {
    return (
      <div className="flex min-h-dvh w-full min-w-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
        >
          {t('nav.skip')}
        </a>
        <aside
          className={cn(
            'sticky top-0 z-30 hidden h-dvh w-[15.5rem] shrink-0 flex-col border-e border-line bg-panel-strong lg:flex',
            'ps-[max(1rem,env(safe-area-inset-left))] pe-3',
          )}
        >
          {sidebar}
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <header className="flex min-w-0 items-center justify-between gap-3 border-b border-line bg-panel-strong/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:hidden">
            <Link
              to="/"
              className="min-w-0 shrink font-display text-[1.35rem] tracking-[-0.03em] text-brand"
              aria-label={t('brand.homeAria')}
            >
              <BrandMark />
            </Link>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              {user ? (
                <AccountMenu displayName={user.displayName} />
              ) : (
                <Link to="/login">
                  <Button className="px-4 text-sm">{t('nav.login')}</Button>
                </Link>
              )}
            </div>
          </header>

          {mobileNav && (
            <div className="border-b border-line bg-panel-strong px-3 py-2 lg:hidden">{mobileNav}</div>
          )}

          <main
            id="main"
            className="mx-auto w-full min-w-0 max-w-[1100px] flex-1 px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-8 lg:pt-8"
          >
            {children}
          </main>
          <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <SiteFooter />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={appShellClass}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
      >
        {t('nav.skip')}
      </a>
      <header className="flex min-w-0 items-center justify-between gap-3 py-5 sm:py-6">
        <Link
          to="/"
          className="min-w-0 shrink font-display text-[1.45rem] tracking-[-0.03em] text-brand sm:text-[1.7rem]"
          aria-label={t('brand.homeAria')}
        >
          <BrandMark />
        </Link>
        <nav aria-label="Primary" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {user ? (
            <AccountMenu displayName={user.displayName} />
          ) : (
            <Link to="/login">
              <Button className="px-4 text-sm sm:px-5 sm:text-base">{t('nav.login')}</Button>
            </Link>
          )}
        </nav>
      </header>
      <main id="main" className="min-w-0">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

export function AccountMenu({
  displayName,
  menuPlacement = 'bottom',
}: {
  displayName: string
  menuPlacement?: 'top' | 'bottom'
}) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const tour = useTourOptional()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          'inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-2xl border border-line bg-panel-strong px-3 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/30',
          menuPlacement === 'top'
            ? 'w-full max-w-full'
            : 'max-w-[11rem] sm:max-w-[16rem]',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserCircle size={20} weight="duotone" className="shrink-0 text-brand" />
        <span className={cn('truncate', menuPlacement === 'top' && 'min-w-0 flex-1 text-start')}>
          {displayName}
        </span>
        <CaretDown size={14} weight="bold" className={cn('shrink-0 text-muted transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute z-40 w-full overflow-hidden rounded-panel border border-line bg-panel-strong py-1.5 shadow-panel',
            menuPlacement === 'top' ? 'bottom-full mb-2 start-0' : 'end-0 top-full mt-2',
          )}
        >
          <MenuLink to="/app" onSelect={close}>
            {t('nav.organizations')}
          </MenuLink>
          {tour && (
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              disabled={tour.active}
              onClick={() => {
                close()
                void tour.startTour()
              }}
            >
              <MapTrifold size={18} weight="duotone" className="shrink-0" />
              {t('nav.tour')}
            </button>
          )}
          <MenuLink to="/preferences" onSelect={close}>
            <UserCircle size={18} weight="duotone" className="shrink-0" />
            {t('nav.preferences')}
          </MenuLink>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => {
              close()
              void logout().finally(() => {
                window.location.replace('/login')
              })
            }}
          >
            <SignOut size={18} className="shrink-0" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

const menuItemClass =
  'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start text-sm font-semibold text-ink transition hover:bg-panel-strong disabled:cursor-not-allowed disabled:opacity-55'

function MenuLink({
  to,
  onSelect,
  children,
}: {
  to: string
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <Link to={to} role="menuitem" className={menuItemClass} onClick={onSelect}>
      {children}
    </Link>
  )
}
