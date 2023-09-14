import type { Ref } from 'vue'
import { useCurrentElement, whenever } from '@vueuse/core'
import type { EventName } from '../api/track'
import type { UseArticleReturn as Article, Resources } from '../types'
import { useSEO } from './seo'
import { useStaticState } from './storipress-payload'
import {
  computed,
  navigateTo,
  onBeforeUnmount,
  onMounted,
  useArticleFilter,
  useDeskFeedLink,
  useNuxtApp,
  useRequestEvent,
} from '#imports'

export type PageType = 'article' | 'desk' | 'tag' | 'author'

export interface SetupPageInput<Type extends PageType> {
  /**
   * page type
   */
  type: Type
  /**
   * set to false to disable auto-generated SEO tags
   */
  seo?: boolean
}

export interface PageTypeMap {
  article: Article
  desk: Desk
  tag: Tag
  author: Author
}

export interface Desk {
  desks: Desk[]
  id: string
  name: string
  slug: string
}

export interface Tag {
  id: string
  name: string
}

export interface Author {
  avatar: string
  bio: string
  bioHTML: string
  created_at: string
  desks: Desk[]
  email: string
  first_name: string
  full_name: string
  name: string
  id: string
  last_name: string
  location: string
  socials: JSON
  updated_at: string
  website: string
}

const eventNameMap: Record<PageType, EventName> = {
  article: 'article.seen',
  desk: 'desk.seen',
  tag: 'tag.seen',
  author: 'author.seen',
}

export function setupPage<Type extends PageType>({ type, seo = true }: SetupPageInput<Type>): Ref<PageTypeMap[Type]> {
  const pageMeta = useResourcePageMeta()

  if (process.server && (!pageMeta.value || pageMeta.value.type !== type)) {
    navigateTo('/')
  }

  const meta = computed(() => {
    return pageMeta.value?.meta
  })

  if (type === 'article') {
    const { $paywall } = useNuxtApp()
    onMounted(async () => {
      await $paywall.mount()
      $paywall.enable()

      whenever(
        meta,
        ({ id, plan }) => {
          $paywall.setArticle({ id, plan })
        },
        { immediate: true, flush: 'sync' },
      )
    })
    onBeforeUnmount(() => {
      $paywall.disable()
    })
  }

  const el = useCurrentElement()
  onMounted(() => {
    if (el.value) {
      // @ts-expect-error inject value to element
      el.value.__spResource = meta.value
    }
    const { $tracker } = useNuxtApp()
    const input = {
      name: eventNameMap[type],
      target_id: '',
    }
    if (meta.value?.id) {
      input.target_id = meta.value.id
    }

    $tracker.withReferer(input)
  })

  if (seo && meta.value) {
    useSEO(meta.value, undefined, pageMeta.value?.type as Resources)
  }

  if (type === 'author') {
    const useArticleFilterTag = useArticleFilter()
    return computed(() => {
      return {
        ...meta.value,
        bio: useArticleFilterTag(meta.value.bio),
        bioHTML: meta.value.bio,
      }
    })
  }

  return meta
}

export function setupArticlePage(seo?: boolean) {
  return setupPage({ type: 'article', seo })
}

export function setupDeskPage(seo?: boolean) {
  const meta = setupPage({ type: 'desk', seo })
  useDeskFeedLink(meta)
  return meta
}

export function setupTagPage(seo?: boolean) {
  return setupPage({ type: 'tag', seo })
}

export function setupAuthorPage(seo?: boolean) {
  return setupPage({ type: 'author', seo })
}

interface PageMeta {
  type: string
  route: string
  meta: any
}

export function useResourcePageMeta() {
  const getPageMeta = (): PageMeta => {
    const event = useRequestEvent()
    return event.context.__sp_page_meta
  }

  const pageMeta = useStaticState<PageMeta | undefined>('page-meta', getPageMeta)
  return pageMeta
}
