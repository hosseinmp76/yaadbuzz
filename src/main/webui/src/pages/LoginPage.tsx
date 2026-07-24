import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../auth'

export default function LoginPage() {
  const { login, accessToken } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('alice@yaadbuzz.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (accessToken) return <Navigate to="/app" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="hero" style={{ maxWidth: 480 }}>
        <h1 className="page-title">Welcome back</h1>
        <p className="muted">Log in to continue building your yearbook.</p>
        <form className="panel" onSubmit={onSubmit}>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label>
          <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></label>
          {error && <p className="error">{error}</p>}
          <button disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
        </form>
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </div>
    </Layout>
  )
}
