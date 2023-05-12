import { encodePath } from 'ufo'
import type { H3Event } from 'h3'
import { setHeader } from 'h3'
import type { ResourcePageContext } from '../types'

// @ts-expect-error generated file
import urls from '#sp-internal/storipress-urls.mjs'

// @ts-expect-error no type
import { defineCachedEventHandler, useNitroApp, useRuntimeConfig } from '#imports'

const RESOURCE = new Set(['article', 'author', 'desk', 'tag'])
const payloadScopes = [
  {
    payloadScope: 'posts',
    urlKey: 'article',
  },
  { payloadScope: 'desks', urlKey: 'desk' },
  { payloadScope: 'authors', urlKey: 'author' },
  { payloadScope: 'tags', urlKey: 'tag' },
  ...Object.keys(urls).flatMap((key) => (RESOURCE.has(key) ? [] : [{ payloadScope: 'tags', urlKey: key }])),
]

const invalidContext: ResourcePageContext = import.meta.env.DEV
  ? new Proxy({} as ResourcePageContext, {
      get(_obj, key) {
        console.warn(`Forbid to access internal context object key ${String(key)} without using \`getResourceOption\``)
        throw new Error('accessing internal context')
      },
    })
  : ({ identity: 'invalid', prefix: '', resource: 'invalid' } as unknown as ResourcePageContext)

export default defineCachedEventHandler(async (event: H3Event) => {
  const runtimeConfig = useRuntimeConfig()

  if (!runtimeConfig.storipress?.fullStatic) {
    setHeader(event, 'content-type', 'text/html')

    return '<div>Internal Page</div>'
  }

  const nitro = useNitroApp()
  const links: string[] = []
  const groupsResponse = await nitro.localFetch(`/_storipress/_custom-field-group.json`, {
    method: 'GET',
  })
  const groups: Record<string, string[]> = await groupsResponse.json()

  await Promise.all(
    payloadScopes.map(async ({ payloadScope, urlKey }) => {
      const res = await nitro.localFetch(`/_storipress/${payloadScope}/__all.json`, { method: 'GET' })
      const items = await res.json()
      const ctx = urls[urlKey]._context ?? invalidContext
      const groupKey = urls[urlKey].groupKey
      const group = groupKey ? groups[groupKey] : null
      for (const item of items) {
        links.push(
          `/_storipress/${payloadScope}/${item.id}.js`,
          ...(urls[urlKey].enable && !groupKey ? [encodePath(urls[urlKey].toURL(item, ctx))] : [])
        )
        if (urls[urlKey].enable && group && group.includes(item.id)) {
          links.push(encodePath(urls[urlKey].toURL(item, ctx)))
        }
      }
    })
  )

  setHeader(event, 'content-type', 'text/html')
  setHeader(event, 'x-nitro-prerender', links.join(','))

  return '<div>Internal Page</div>'
})
