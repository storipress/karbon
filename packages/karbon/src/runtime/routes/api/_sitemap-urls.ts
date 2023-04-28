import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  //   const pageResources = await getResources(nuxt.options.runtimeConfig.storipress)

  //   const invalidContext = { identity: 'invalid', prefix: '', resource: 'invalid' } as unknown as ResourcePageContext

  //   const urlList: { url: string }[] = payloadScopes
  //     .map(({ payloadScope, urlKey }) => {
  //       if (!resources[urlKey].enable) return []

  //       const resourcesCtx = resources[urlKey]._context ?? invalidContext
  //       const scopeUrlList = pageResources[payloadScope].map((item: any) => {
  //         return { url: encodePath(resources[urlKey].toURL(item, resourcesCtx)) }
  //       })

  //       return scopeUrlList
  //     })
  //     .flat()

  //   const ctxUrls = ctx.urls
  //   ctxUrls.push(...urlList)
  return [{ loc: 'https://storipress.com/test-rul' }]
})
