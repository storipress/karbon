import { filter, forEachObj, map, pipe, toPairs } from 'remeda'
import { loadStoripressPayload } from '../composables/storipress-payload'
import { createLoadOnce } from '../utils/load-once'
import type { PayloadScope } from '../types'
import { defineNuxtPlugin, loadPayload, shallowRef, useRouter } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) {
    const cache = new Map<string, unknown>()
    nuxtApp.payload.storipressPayload = cache

    return {
      provide: {
        storipressPayload: {
          cache,
          static: shallowRef({} as Record<string, unknown>),
        },
      },
    }
  }

  const staticState = shallowRef({} as Record<string, unknown>)

  forEachObj.indexed(nuxtApp.payload.data, (item, key) => {
    if (typeof key === 'string' && key.startsWith('sp$$static$')) {
      staticState.value[key] = item
    }
  })

  const cache: Map<string, unknown> = nuxtApp.payload.storipressPayload || new Map()
  const loadOnce = createLoadOnce(cache)
  useRouter().beforeResolve(async (to, from) => {
    if (to.path === from.path) {
      return
    }
    const payload = await loadPayload(to.path)
    if (!payload) {
      return
    }

    forEachObj.indexed(payload.data, (item, key) => {
      if (typeof key === 'string' && key.startsWith('sp$$static$')) {
        staticState.value[key] = item
      }
    })

    await Promise.all(
      pipe(
        payload.data,
        toPairs,
        filter(([key]) => key.startsWith('sp$$payload')),
        map(async ([, data]) => {
          const { scope, name } = data as { scope: PayloadScope; name: string }
          const cacheKey = `${scope}:${name}`
          try {
            loadOnce(cacheKey, () => {
              return loadStoripressPayload(scope, name)
            })
          } catch {}
        })
      )
    )
  })

  return {
    provide: {
      storipressPayload: {
        cache,
        static: staticState,
      },
    },
  }
})
