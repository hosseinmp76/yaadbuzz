import { BookOpenText, UsersThree } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth'

export default function LandingPage() {
  const { user } = useAuth()
  return (
    <Layout>
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden pb-16 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-2xl"
        >
          <h1 className="font-display text-[clamp(3.4rem,10vw,6.2rem)] leading-[0.92] tracking-[-0.05em]">
            Yaad<span className="text-brand">buzz</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Create an organization, gather your team, collect memories, and print a yearbook worth keeping.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link to="/app">
                <Button>Open dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button>Start your yearbook</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary">I already have an account</Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="pointer-events-none absolute inset-y-8 right-[-8%] hidden w-[48%] rounded-[2rem] border border-line bg-panel shadow-panel md:block"
          style={{
            background:
              'linear-gradient(145deg, color-mix(in oklab, var(--brand) 18%, transparent), transparent 55%), var(--panel-strong)',
          }}
        >
          <div className="absolute left-10 top-12 flex items-center gap-3 text-brand">
            <UsersThree size={36} weight="duotone" />
            <span className="font-display text-2xl tracking-tight">Teams</span>
          </div>
          <div className="absolute bottom-14 left-10 flex items-center gap-3 text-accent">
            <BookOpenText size={36} weight="duotone" />
            <span className="font-display text-2xl tracking-tight">Yearbooks</span>
          </div>
        </motion.div>
      </section>
    </Layout>
  )
}
