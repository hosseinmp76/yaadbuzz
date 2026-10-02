import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import fa from './locales/fa.json'
import es from './locales/es.json'
import ru from './locales/ru.json'
import zh from './locales/zh.json'
import it from './locales/it.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import he from './locales/he.json'
import de from './locales/de.json'
import { getLanguage, languages } from './languages'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
      es: { translation: es },
      ru: { translation: ru },
      zh: { translation: zh },
      it: { translation: it },
      fr: { translation: fr },
      ar: { translation: ar },
      he: { translation: he },
      de: { translation: de },
    },
    fallbackLng: 'en',
    supportedLngs: languages.map(({ code }) => code),
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'yaadbuzz.lang',
    },
  })

export function applyDocumentLanguage(lng: string) {
  const language = getLanguage(lng)
  const root = document.documentElement
  root.lang = language.code === 'zh' ? 'zh-Hans' : language.code
  root.dir = language.dir

  // Inline so theme color vars cannot wipe Arabic-script typography.
  if (language.code === 'fa' || language.code === 'ar') {
    root.style.setProperty('--font-display-family', '"Vazirmatn", Tahoma, sans-serif')
    root.style.setProperty('--font-body-family', '"Vazirmatn", Tahoma, sans-serif')
  } else if (language.code === 'he') {
    root.style.setProperty('--font-display-family', 'Arial, Tahoma, sans-serif')
    root.style.setProperty('--font-body-family', 'Arial, Tahoma, sans-serif')
  } else if (language.code === 'zh') {
    root.style.setProperty('--font-display-family', '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif')
    root.style.setProperty('--font-body-family', '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif')
  } else {
    root.style.setProperty('--font-display-family', '"Fraunces", Georgia, serif')
    root.style.setProperty('--font-body-family', '"Source Sans 3", system-ui, sans-serif')
  }
}

i18n.on('languageChanged', applyDocumentLanguage)
applyDocumentLanguage(i18n.language)

export default i18n
