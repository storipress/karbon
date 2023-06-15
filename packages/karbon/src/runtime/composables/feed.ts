import type { MaybeRef } from '@vueuse/core'
import type { Desk } from './page-meta'
import { useHead } from '#imports'

export function useFeedLink() {
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig?.public?.siteUrl || ''

  useHead({
    link: [
      {
        rel: 'alternate',
        href: `${siteUrl}/atom.xml`,
        type: 'application/atom+xml',
      },
    ],
  })
}

export function useDeskFeedLink(deskMeta: MaybeRef<Desk>) {
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig?.public?.siteUrl || ''
  const meta = toRef(deskMeta)

  useHead({
    link: [
      {
        rel: 'alternate',
        href: `${siteUrl}/atom/${meta.value.slug}.xml`,
        type: 'application/atom+xml',
      },
    ],
  })
}
