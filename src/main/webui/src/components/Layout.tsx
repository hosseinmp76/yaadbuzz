import { Link } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  return (
    <div className="shell">
      <header className="topbar">
        <Link to={user ? '/app' : '/'} className="brand">Yaad<span>buzz</span></Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span className="muted">{user.displayName}</span>
              <button className="secondary" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register"><button>Get started</button></Link>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  )
}
