import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../auth'

export default function LandingPage() {
  const { user } = useAuth()
  return (
    <Layout>
      <section className="hero">
        <p className="chip">Online yearbook generator</p>
        <h1>Yaadbuzz</h1>
        <p>Create an organization, gather your team, collect memories, and print a yearbook worth keeping.</p>
        <div className="cta-row">
          {user ? (
            <Link to="/app"><button>Open dashboard</button></Link>
          ) : (
            <>
              <Link to="/register"><button>Start your yearbook</button></Link>
              <Link to="/login"><button className="secondary">I already have an account</button></Link>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
