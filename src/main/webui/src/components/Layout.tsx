import { MapTrifold, SignOut, UserCircle } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth'
import { useTourOptional } from '../onboarding/useTour'
import { BrandMark } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SiteFooter } from './SiteFooter'
import { Button } from './ui/Button'
import { appShellClass } from './ui/styles'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const tour = useTourOptional()

  return (
    <div className={appShellClass}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
      >
        {t('nav.skip')}
      </a>
      <header className="flex items-center justify-between gap-2 py-4 sm:py-5">
        <Link
          to={user ? '/app' : '/'}
          className="shrink-0 font-display text-[1.35rem] tracking-[-0.03em] sm:text-[1.6rem]"
          aria-label={t('brand.homeAria')}
        >
          <BrandMark />
        </Link>
        <nav aria-label="Primary" className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher />
          <Link
            to="/app"
            className="px-2 text-sm font-semibold text-muted hover:text-ink sm:text-base"
          >
            {t('nav.organizations')}
          </Link>
          {user ? (
            <>
              {tour && (
                <Button
                  variant="ghost"
                  className="px-2 py-2 text-sm font-semibold text-muted hover:text-ink sm:px-2.5"
                  aria-label={t('nav.tour')}
                  disabled={tour.active}
                  onClick={() => {
                    void tour.startTour()
                  }}
                >
                  <MapTrifold size={20} weight="duotone" />
                  <span className="hidden sm:inline">{t('nav.tour')}</span>
                </Button>
              )}
              <Link
                to="/preferences"
                className="inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-muted hover:text-ink sm:text-base"
                aria-label={t('nav.preferences')}
              >
                <UserCircle size={20} weight="duotone" className="sm:hidden" />
                <span className="hidden sm:inline">{t('nav.preferences')}</span>
              </Link>
              <Button
                variant="secondary"
                className="px-3 sm:px-5"
                aria-label={t('nav.logout')}
                onClick={() => {
                  void logout()
                }}
              >
                <SignOut size={18} />
                <span className="hidden sm:inline">{t('nav.logout')}</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2 text-sm font-semibold text-ink sm:text-base">
                {t('nav.login')}
              </Link>
              <Link to="/register">
                <Button className="px-3.5 text-sm sm:px-5 sm:text-base">{t('nav.getStarted')}</Button>
              </Link>
            </>
          )}
        </nav>
      </header>
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  )
}
