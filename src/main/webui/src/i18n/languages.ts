export const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'zh', name: '简体中文', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
] as const

export function getLanguage(locale: string) {
  const base = locale.toLowerCase().split(/[-_]/)[0]
  const code = base === 'iw' ? 'he' : base
  return languages.find((language) => language.code === code) ?? languages[0]
}
