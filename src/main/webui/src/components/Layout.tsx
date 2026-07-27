import { SignOut, UserCircle } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { SiteFooter } from './SiteFooter'
import { Button } from './ui/Button'
import { appShellClass } from './ui/styles'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className={appShellClass}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
      >
        Skip to content
      </a>
      <header className="flex items-center justify-between gap-2 py-4 sm:py-5">
        <Link
          to={user ? '/app' : '/'}
          className="shrink-0 font-display text-[1.35rem] tracking-[-0.03em] sm:text-[1.6rem]"
          aria-label="Yaadbuzz home"
        >
          Yaad<span className="text-brand">buzz</span>
        </Link>
        <nav aria-label="Primary" className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <Link
            to="/about"
            className="px-2 text-sm font-semibold text-muted hover:text-ink sm:text-base"
          >
            About
          </Link>
          {user ? (
            <>
              <Link
                to="/preferences"
                className="inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-muted hover:text-ink sm:text-base"
                aria-label="Preferences"
              >
                <UserCircle size={20} weight="duotone" className="sm:hidden" />
                <span className="hidden sm:inline">Preferences</span>
              </Link>
              <span className="hidden max-w-[10rem] truncate text-muted md:inline">
                {user.displayName}
              </span>
              <Button
                variant="secondary"
                className="px-3 sm:px-5"
                aria-label="Log out"
                onClick={logout}
              >
                <SignOut size={18} />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2 text-sm font-semibold text-ink sm:text-base">
                Log in
              </Link>
              <Link to="/register">
                <Button className="px-3.5 text-sm sm:px-5 sm:text-base">Get started</Button>
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
