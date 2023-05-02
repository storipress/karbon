import { defineEventHandler } from 'h3'
import { encodePath } from 'ufo'
import type { ResourcePageContext } from '../../types'
import urls from '#sp-internal/storipress-urls.mjs'
import { getResources, payloadScopes } from '@storipress/karbon/internal'

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
        }
      })

      return scopeUrlList
    })
    .flat()
  return urlList
})
