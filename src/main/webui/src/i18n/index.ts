import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import fa from './locales/fa.json'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fa'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'yaadbuzz.lang',
    },
  })

export function applyDocumentLanguage(lng: string) {
  const lang = lng.startsWith('fa') ? 'fa' : 'en'
  const root = document.documentElement
  root.lang = lang
  root.dir = lang === 'fa' ? 'rtl' : 'ltr'

  // Inline so theme color vars cannot wipe Persian typography.
  if (lang === 'fa') {
    root.style.setProperty('--font-display-family', '"Vazirmatn", Tahoma, sans-serif')
    root.style.setProperty('--font-body-family', '"Vazirmatn", Tahoma, sans-serif')
  } else {
    root.style.setProperty('--font-display-family', '"Fraunces", Georgia, serif')
    root.style.setProperty('--font-body-family', '"Source Sans 3", system-ui, sans-serif')
  }
}

i18n.on('languageChanged', applyDocumentLanguage)
applyDocumentLanguage(i18n.language)

export default i18n
