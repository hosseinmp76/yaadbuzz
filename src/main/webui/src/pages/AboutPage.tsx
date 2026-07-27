import { ArrowUpRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Seo } from '../seo/Seo'
import { SITE_URL } from '../seo/site'

const X_URL = 'https://x.com/yaadbuzz_ir'

export default function AboutPage() {
  return (
    <Layout>
      <Seo
        title="About"
        description="Why Yaadbuzz exists — a college wish to keep shared memories, now an open-source online yearbook for teams."
        path="/about"
      />

      <section className="max-w-2xl pb-8 pt-6 sm:pt-10">
        <p className="text-sm font-semibold tracking-[0.08em] uppercase text-muted">About</p>
        <h1 className="mt-2 font-display text-[clamp(2.4rem,8vw,3.8rem)] leading-[0.95] tracking-[-0.04em]">
          Yaad<span className="text-brand">buzz</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          An online yearbook born from a simple college wish: keep the year, together.
        </p>
      </section>

      <article className="max-w-2xl space-y-6 border-t border-line py-10 text-base leading-relaxed text-ink sm:text-lg">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">The story</h2>
        <p>
          When I was in college, I wanted something like this — a place where our class could share
          memories, write about each other, and hold onto the year without it vanishing into chat
          threads and scattered photos.
        </p>
        <p>
          We had the friendships and the moments. What we did not have was a warm, shared home for
          them: tributes that could wait for reveal day, memories we all owned, a yearbook we could
          open online and print when we were ready.
        </p>
        <p>
          Yaadbuzz is that home. It is free and open source under the{' '}
          <a
            href="/LICENSE.txt"
            className="font-semibold text-brand underline-offset-2 hover:underline"
          >
            GNU Affero General Public License v3
          </a>
          , so others can run it, improve it, and keep their own years alive — including when the
          software is offered as a network service.
        </p>
      </article>

      <section className="max-w-2xl space-y-4 border-t border-line py-10" aria-labelledby="license-heading">
        <h2 id="license-heading" className="font-display text-2xl tracking-tight">
          License
        </h2>
        <p className="text-muted leading-relaxed">
          Yaadbuzz is licensed under the{' '}
          <strong className="text-ink">GNU Affero General Public License version 3</strong> (AGPL-3.0).
          You can use, study, share, and change the software; if you run a modified version on a
          server for others, you must offer them the corresponding source.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href="/LICENSE.txt">
            <Button variant="secondary" className="w-full sm:w-auto">
              Read the full license
            </Button>
          </a>
          <Link to="/source">
            <Button variant="secondary" className="w-full sm:w-auto">
              Corresponding source
            </Button>
          </Link>
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Button variant="ghost" className="w-full sm:w-auto">
              AGPL-3.0 on gnu.org
              <ArrowUpRight size={18} />
            </Button>
          </a>
        </div>
      </section>

      <section className="max-w-2xl space-y-4 border-t border-line py-10">
        <h2 className="font-display text-2xl tracking-tight">Follow along</h2>
        <p className="text-muted">
          Updates and notes live on X at{' '}
          <a
            href={X_URL}
            className="font-semibold text-brand underline-offset-2 hover:underline"
            rel="noopener noreferrer me"
            target="_blank"
          >
            @yaadbuzz_ir
          </a>
          .
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={X_URL} rel="noopener noreferrer me" target="_blank">
            <Button variant="secondary" className="w-full sm:w-auto">
              @yaadbuzz_ir on X
              <ArrowUpRight size={18} />
            </Button>
          </a>
          <Link to="/register">
            <Button className="w-full sm:w-auto">Start your yearbook</Button>
          </Link>
        </div>
        <p className="pt-2 text-sm text-muted">
          Site:{' '}
          <a href={SITE_URL} className="font-semibold text-ink hover:text-brand">
            yaadbuzz.ir
          </a>
        </p>
      </section>
    </Layout>
  )
}
