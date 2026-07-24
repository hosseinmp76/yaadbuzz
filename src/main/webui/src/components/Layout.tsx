import { SignOut } from '@phosphor-icons/react'
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
    <div className="mx-auto w-[min(1100px,calc(100%-2rem))] pb-16">
      <header className="flex items-center justify-between py-5">
        <Link to={user ? '/app' : '/'} className="font-display text-[1.6rem] tracking-[-0.03em]">
          Yaad<span className="text-brand">buzz</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative" ref={themeRef}>
            <Button variant="secondary" onClick={() => setThemeOpen((v) => !v)}>
              Themes
            </Button>
            {themeOpen && (
              <div
                className={clsx(
                  'absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-[18px] border border-line bg-panel-strong p-3 shadow-panel',
                )}
              >
                <ThemePicker compact />
              </div>
            )}
          </div>
          {user ? (
            <>
              <span className="hidden text-muted sm:inline">{user.displayName}</span>
              <Button variant="secondary" onClick={logout}>
                <SignOut size={18} />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-ink">
                Log in
              </Link>
              <Link to="/register">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  )
}
