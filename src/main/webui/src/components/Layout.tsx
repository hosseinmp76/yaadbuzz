import { Palette, SignOut } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { ThemePicker } from './ThemePicker'
import { Button } from './ui/Button'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!themeOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!themeRef.current?.contains(event.target as Node)) {
        setThemeOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setThemeOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [themeOpen])

  return (
    <div className="app-shell">
      <header className="flex items-center justify-between gap-2 py-4 sm:py-5">
        <Link
          to={user ? '/app' : '/'}
          className="shrink-0 font-display text-[1.35rem] tracking-[-0.03em] sm:text-[1.6rem]"
        >
          Yaad<span className="text-brand">buzz</span>
        </Link>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <div className="relative" ref={themeRef}>
            <Button
              variant="secondary"
              className="px-3 sm:px-5"
              aria-expanded={themeOpen}
              aria-label="Themes"
              onClick={() => setThemeOpen((v) => !v)}
            >
              <Palette size={18} weight="duotone" />
              <span className="hidden sm:inline">Themes</span>
            </Button>
            {themeOpen && (
              <div
                className={clsx(
                  'absolute right-0 z-20 mt-2 max-h-[min(70vh,28rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-[18px] border border-line bg-panel-strong p-3 shadow-panel',
                )}
              >
                <ThemePicker compact />
              </div>
            )}
          </div>
          {user ? (
            <>
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
        </div>
      </header>
      {children}
    </div>
  )
}
