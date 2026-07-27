import { Link } from 'react-router-dom'

const AGPL_URL = 'https://www.gnu.org/licenses/agpl-3.0.html'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-line pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm text-muted">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} Yaadbuzz · free &amp; open source under the{' '}
          <a
            href="/LICENSE.txt"
            className="font-semibold text-ink underline-offset-2 hover:text-brand hover:underline"
          >
            GNU Affero GPL v3
          </a>
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/about" className="font-semibold text-ink hover:text-brand">
            About
          </Link>
          <a
            href="/LICENSE.txt"
            className="font-semibold text-ink hover:text-brand"
          >
            License
          </a>
          <a
            href={AGPL_URL}
            className="font-semibold text-ink hover:text-brand"
            rel="noopener noreferrer"
            target="_blank"
          >
            AGPL-3.0
          </a>
        </nav>
      </div>
    </footer>
  )
}
