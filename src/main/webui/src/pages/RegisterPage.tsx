import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../auth'

export default function RegisterPage() {
  const { register, accessToken } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (accessToken) return <Navigate to="/app" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(email, password, displayName)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="hero" style={{ maxWidth: 480 }}>
        <h1 className="page-title">Create your Yaadbuzz</h1>
        <p className="muted">One account, many teams, endless memories.</p>
        <form className="panel" onSubmit={onSubmit}>
          <label>Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></label>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label>
          <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required /></label>
          {error && <p className="error">{error}</p>}
          <button disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </Layout>
  )
}
