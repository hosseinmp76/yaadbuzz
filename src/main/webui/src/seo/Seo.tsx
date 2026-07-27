import { useEffect } from 'react'
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from './site'

type SeoProps = {
  title?: string
  description?: string
  /** Path only, e.g. `/login` — used for canonical + og:url */
  path?: string
  /** Hide private app surfaces from indexing */
  noIndex?: boolean
  /** Optional absolute or site-relative image for social previews */
  image?: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Updates document head for the current route (title, description, social, robots).
 * Base tags also live in index.html for first paint / non-JS crawlers.
 */
export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  noIndex = false,
  image = '/og.svg',
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} · ${SITE_NAME}`
      : `${SITE_NAME} — Online yearbooks for teams`
    const url = absoluteUrl(path)
    const imageUrl = image.startsWith('http') ? image : absoluteUrl(image)

    document.title = fullTitle

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)
    upsertMeta('name', 'twitter:site', '@yaadbuzz_ir')
    upsertMeta('name', 'twitter:creator', '@yaadbuzz_ir')
    upsertLink('canonical', url)
  }, [title, description, path, noIndex, image])

  return null
}
