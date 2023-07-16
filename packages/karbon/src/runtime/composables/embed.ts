import type { DeferredPromise } from 'p-defer'
import pDefer from 'p-defer'
import { useHead, useNuxtApp } from '#imports'

const IG_URL = 'https://platform.instagram.com/en_US/embeds.js'
const TWITTER_URL = 'https://platform.twitter.com/widgets.js'

const thirdPartyScripts = [
  {
    key: 'twitter',
    src: TWITTER_URL,
  },
  {
    key: 'instagram',
    src: IG_URL,
  },
]

const providers = {
  // from https://github.com/sugarshin/react-instagram-embed/blob/master/src/index.tsx
  async instagram() {
    try {
      // @ts-expect-error no type def
      window.instgrm.Embeds.process()
    } catch {}
  },

  async twitter() {
    try {
      // @ts-expect-error no type def
      window.twttr.widgets.load()
    } catch {}
  },

  async iframely() {
    const nuxt = useNuxtApp()
    nuxt.$iframely.load()
  },
}

export function useEmbed() {
  const loadMap = new Map<string, DeferredPromise<void>>()

  useHead({
    script: thirdPartyScripts.map(({ key, src }) => {
      const deferred = pDefer<void>()
      loadMap.set(key, deferred)

      return {
        key,
        async: true,
        src,
        onload: () => {
          deferred.resolve()
        },
      }
    }),
  })

  return {
    async loadAll() {
      await Promise.all(
        Object.entries(providers).map(async ([key, fn]) => {
          const loadPromise = loadMap.get(key)
          if (loadPromise) {
            await loadPromise.promise
          }
          await fn()
        }),
      )
    },
  }
}
