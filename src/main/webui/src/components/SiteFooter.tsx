import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const AGPL_URL = 'https://www.gnu.org/licenses/agpl-3.0.html'

export function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className="mt-20 border-t border-line pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm text-muted">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {t('footer.copy', { year })}{' '}
          <a
            href="/LICENSE.txt"
            className="font-semibold text-ink underline-offset-2 hover:text-brand hover:underline"
          >
            {t('footer.licenseName')}
          </a>
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/about" className="font-semibold text-ink hover:text-brand">
            {t('footer.about')}
          </Link>
          <Link to="/features" className="font-semibold text-ink hover:text-brand">
            {t('footer.features')}
          </Link>
          <Link to="/source" className="font-semibold text-ink hover:text-brand">
            {t('footer.source')}
          </Link>
          <a href="/LICENSE.txt" className="font-semibold text-ink hover:text-brand">
            {t('footer.license')}
          </a>
          <a
            href={AGPL_URL}
            className="font-semibold text-ink hover:text-brand"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('footer.agpl')}
          </a>
        </nav>
      </div>
    </footer>
  )
}
