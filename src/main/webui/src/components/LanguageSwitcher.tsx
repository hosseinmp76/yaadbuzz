import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const current = i18n.language.startsWith('fa') ? 'fa' : 'en'

  return (
    <label className={cn('inline-flex items-center gap-1.5 text-sm font-semibold text-muted', className)}>
      <span className="sr-only">{t('preferences.language')}</span>
      <select
        className="rounded-2xl border border-line bg-panel-strong px-2.5 py-1.5 text-ink shadow-sm"
        value={current}
        aria-label={t('preferences.language')}
        onChange={(e) => {
          void i18n.changeLanguage(e.target.value)
        }}
      >
        <option value="en">{t('lang.en')}</option>
        <option value="fa">{t('lang.fa')}</option>
      </select>
    </label>
  )
}
