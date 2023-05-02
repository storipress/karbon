import { defineEventHandler } from 'h3'
import { encodePath } from 'ufo'
import type { ResourcePageContext } from '../../types'
import urls from '#sp-internal/storipress-urls.mjs'
import { getResources, payloadScopes } from '@storipress/karbon/internal'

export default defineEventHandler(async () => {
  const pageResources = await getResources()

  const invalidContext = { identity: 'invalid', prefix: '', resource: 'invalid' } as unknown as ResourcePageContext

  const urlList: { url: string }[] = payloadScopes
    .map(({ payloadScope, urlKey }: { payloadScope: string; urlKey: string }) => {
      if (!urls[urlKey].enable) return []

      const resourcesCtx = urls[urlKey]._context ?? invalidContext
      const scopeUrlList = pageResources[payloadScope].map((item: any) => {
        return { url: encodePath(urls[urlKey].toURL(item, resourcesCtx)) }
      })

      return scopeUrlList
    })
    .flat()
  return urlList
})
