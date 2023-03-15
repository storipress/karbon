import type { MaybeRef } from '@vueuse/core'
import { hash } from 'ohash'
import type { Ref } from 'vue'
import { useClamp } from '@vueuse/math'
import type { ConditionInput } from '../lib/article-filter'
import { evaluateCondition, normalizeCondition } from '../lib/article-filter'
import type { UseArticleReturnWithURL } from '../types'
import { watchInvariant } from '../utils/watch-invariant'
import { getAllArticles, usePageMetaAsCondition } from './front-page'
import { computed, unref, useStaticAsyncState } from '#imports'

export interface UseArticlePaginationInput {
  /**
   * limit pre page articles
   */
  limit: MaybeRef<number>
  /**
   * filter article
   * @see useFillArticles
   */
  conditions?: ConditionInput[]
}

interface UsePaginationReturn<T> {
  /**
   * current page number
   */
  page: Ref<number>
  /**
   * total amount of pages
   */
  total: Ref<number>
  /**
   * items of current page
   */
  list: Ref<T[]>
  /**
   * A boolean to indicate that is there has next page
   */
  hasNextPage: Ref<boolean>
  /**
   * A boolean to indicate that is there has previous page
   */
  hasPreviousPage: Ref<boolean>
  /**
   * switch to next page
   */
  nextPage: () => void
  /**
   * switch to previous page
   */
  previousPage: () => void
}

export interface UseArticlePaginationReturn extends Omit<UsePaginationReturn<UseArticleReturnWithURL>, 'list'> {
  /**
   * current page number
   *
   * it's ok to modify the page number directly if you need to jump to a specific page
   */
  page: Ref<number>
  /**
   * total amount of pages
   */
  total: Ref<number>
  /**
   * articles for current page
   */
  articles: Ref<UseArticleReturnWithURL[]>
  /**
   * A boolean to indicate that is there has next page
   */
  hasNextPage: Ref<boolean>
  /**
   * A boolean to indicate that is there has previous page
   */
  hasPreviousPage: Ref<boolean>
  /**
   * switch to next page
   */
  nextPage: () => void
  /**
   * switch to previous page
   */
  previousPage: () => void
}

/**
 * A helper to help you build a pagination page to list articles
 * @param options Options for article pagination
 * @returns
 */
export function useArticlePagination({
  conditions: conditionInput = usePageMetaAsCondition(),
  limit,
}: UseArticlePaginationInput): UseArticlePaginationReturn {
  const { conditions } = normalizeCondition(conditionInput)
  const allArticles = useStaticAsyncState(`pagination-article-${hash(conditions)}`, async () => {
    const _allArticles = (await getAllArticles()) ?? []
    return _allArticles.filter((article) => evaluateCondition(article, conditions))
  })

  const { list, ...paginated } = usePagination(allArticles, limit)
  return {
    ...paginated,
    articles: list,
  }
}

/**
 * Helper for paginate any data
 * @param allItems All the items
 * @param limit Item per page
 * @returns Paginated result
 */
export function usePagination<T>(allItems: Ref<T[]>, limit: MaybeRef<number>): UsePaginationReturn<T> {
  // precondition
  watchInvariant(() => unref(limit) > 0, '`limit` must not be negative or 0')

  const total = computed(() => {
    const length = allItems.value.length
    const remaining = length % unref(limit)
    return Math.floor(length / unref(limit)) + (remaining > 0 ? 1 : 0)
  })
  const page = useClamp(1, 1, total)

  // paginate allArticles with `limit` as pre page
  const list = computed(() => {
    const start = (page.value - 1) * unref(limit)
    const end = start + unref(limit)
    return allItems.value.slice(start, end)
  })

  const hasNextPage = computed(() => {
    return page.value < total.value
  })

  const hasPreviousPage = computed(() => page.value > 1)

  const nextPage = () => {
    // Safety: useClamp will ensure page is valid
    page.value += 1
  }

  const previousPage = () => {
    // Safety: useClamp will ensure page is valid
    page.value -= 1
  }

  return {
    page,
    total,
    list,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
  }
}
