import { defineEventHandler } from 'h3'
import { encodePath } from 'ufo'
import { getResources, payloadScopes } from '@storipress/karbon/internal'
import { destr } from 'destr'
import type { ResourcePageContext } from '../../types'
import urls from '#sp-internal/storipress-urls.mjs'

const sitemapConfig: Record<string, { priority: number }> = {
  posts: {
    priority: 0.8,
  },
  tags: {
    priority: 0.5,
  },
  desks: {
    priority: 0.5,
  },
  authors: {
    priority: 0.5,
  },
}

export default defineEventHandler(async () => {
  const pageResources = await getResources()
  const now = new Date().toISOString()

  const invalidContext = { identity: 'invalid', prefix: '', resource: 'invalid' } as unknown as ResourcePageContext

  const urlList: { loc: string; lastmod: string }[] = payloadScopes
    .map(({ payloadScope, urlKey }: { payloadScope: string; urlKey: string }) => {
      if (!urls[urlKey].enable) return []

      const resourcesCtx = urls[urlKey]._context ?? invalidContext
      const scopeUrlList = pageResources[payloadScope].map((item: any) => {
        const lastmod = item.published_at || item.updated_at || item.created_at || now
        return {
          loc: encodePath(urls[urlKey].toURL(item, resourcesCtx)),
          lastmod,
          images: extractCover(item),
          ...sitemapConfig[payloadScope],
        }
      })

      return scopeUrlList
    })
    .flat()
  return urlList
})

function extractCover(item: { cover?: string | null | undefined }) {
  if (!item.cover) {
    return undefined
  }
  try {
    const { url, caption, alt } = destr<{ url: string; caption: string; alt: string }>(item.cover)
    return [{ loc: url, title: alt, caption }]
  } catch {
    return undefined
  }
}
