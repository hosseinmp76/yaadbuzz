/** Public site URL used for canonical / Open Graph / sitemap. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'https://yaadbuzz.ir'

export const SITE_NAME = 'Yaadbuzz'

export const DEFAULT_DESCRIPTION =
  'Yaadbuzz is an online yearbook for teams and organizations — collect tributes, memories, and awards, then print a keepsake PDF.'

export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized === '/' ? '/' : normalized}`
}
