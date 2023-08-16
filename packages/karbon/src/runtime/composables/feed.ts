import type { MaybeRef } from '@vueuse/core'
import { toValue } from '@vueuse/core'
import { joinURL } from 'ufo'
import type { Desk } from './page-meta'
import { useHead, useRuntimeConfig } from '#imports'

export function useFeedLink() {
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig?.public?.siteUrl || ''

  useHead({
    link: [
      {
        key: 'karbon-atom-feed',
        rel: 'alternate',
        href: joinURL(siteUrl, '/atom.xml'),
        type: 'application/atom+xml',
      },
    ],
  })
}

export function useDeskFeedLink(deskMeta: MaybeRef<Desk>) {
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig?.public?.siteUrl || ''

  useHead(() => ({
    link: [
      {
        key: 'karbon-atom-feed',
        rel: 'alternate',
        href: joinURL(siteUrl, `/atom/${toValue(deskMeta).slug}.xml`),
        type: 'application/atom+xml',
        tagPriority: 'high',
      },
    ],
  }))
}
