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

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div className={appShellClass}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
      >
        {t('nav.skip')}
      </a>
      <header className="flex min-w-0 items-center justify-between gap-3 py-4 sm:py-5">
        <Link
          to={user ? '/app' : '/'}
          className="min-w-0 shrink font-display text-[1.35rem] tracking-[-0.03em] sm:text-[1.6rem]"
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

function AccountMenu({ displayName }: { displayName: string }) {
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
          'inline-flex max-w-[11rem] min-h-11 touch-manipulation items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-strong sm:max-w-[16rem]',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserCircle size={20} weight="duotone" className="shrink-0 text-brand" />
        <span className="truncate">{displayName}</span>
        <CaretDown size={14} weight="bold" className={cn('shrink-0 text-muted transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 z-40 mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-panel border border-line bg-panel py-1 shadow-panel backdrop-blur-md"
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
              void logout()
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
