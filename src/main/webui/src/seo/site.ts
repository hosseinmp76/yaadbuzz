/** Public site URL used for canonical / Open Graph / sitemap. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'https://yaadbuzz.ir'

export const SITE_NAME = 'Yaadbuzz'

export const DEFAULT_DESCRIPTION =
  'Build a yearbook together with your team. Yaad means memory; buzz means someone with a lot of something — someone rich in memories. Free open source software.'

export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized === '/' ? '/' : normalized}`
}
