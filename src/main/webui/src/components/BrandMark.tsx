import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'

/** Localized brand mark: “Yaadbuzz” or “یادباز”. */
export function BrandMark({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const fa = i18n.language.startsWith('fa')

  if (fa) {
    return (
      <span className={cn('text-brand', className)}>{t('brand.name')}</span>
    )
  }

  return (
    <span className={className}>
      {t('brand.prefix')}
      <span className="text-brand">{t('brand.suffix')}</span>
    </span>
  )
}
