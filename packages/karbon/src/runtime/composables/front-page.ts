import type { Ref } from 'vue'
import { warn } from 'vue'
import { hash } from 'ohash'
import type { MaybeRef } from '@vueuse/core'
import type { Promisable } from 'type-fest'
import { extendRef } from '@vueuse/core'
import type { AsyncData } from 'nuxt/app'
import type { UseArticleReturn, UseArticleReturnWithURL } from '../types'
import { useStaticAsyncState } from '../composables/storipress-payload'
import type { Condition, ConditionInput } from '../lib/article-filter'
import { evaluateCondition, normalizeCondition } from '../lib/article-filter'
import { useResourceList } from './resources'
import { useEventGlobal, useEventOnce } from './event-once'
import { computed, onServerPrefetch, unref, useResourcePageMeta } from '#imports'

export type Article = UseArticleReturn

export interface Layout {
  id: string
}

let hookFillInUsing = () => {}

if (import.meta.hot) {
  let using = false
  hookFillInUsing = () => {
    using = true
  }

  function reload() {
    console.warn('useFillInArticles is a stateful function and can not handle hot module replacement, reloading window')
    location.reload()
  }

  import.meta.hot.accept(() => {
    reload()
  })

  import.meta.hot.on('vite:beforeUpdate', () => {
    if (using) {
      reload()
    }
  })
}

export function getAllArticles(): AsyncData<UseArticleReturnWithURL[], true | null> {
  return useResourceList('article', {
    key: 'all',
    transform: (data) => {
      return (
        data?.map(({ meta, url }) => {
          const article = meta as unknown as UseArticleReturnWithURL
          article.url = url
          return article
        }) ?? []
      )
    },
  })
}

export const useGetAllArticles = useEventOnce(() => {
  const promise = getAllArticles()
  onServerPrefetch(() => promise)
  return promise
})

const getAlreadyUsed = useEventGlobal('alreadyUsed', () => new Set<string>([]))
const getSourceCursor = useEventGlobal('sourceCursor', () => new Map<string, Article[]>())

export function usePageMetaAsCondition(): Condition[] {
  const pageMeta = useResourcePageMeta()
  if (!pageMeta.value) {
    return []
  }

  const { type, meta } = pageMeta.value
  if (type === 'desk' || type === 'tag' || type === 'author') {
    return [{ type, key: 'id', value: meta.id }]
  }

  return []
}

export function clearFillHistory() {
  getAlreadyUsed().clear()
  getSourceCursor().clear()
}

function _getAllArticles() {
  const allArticles = useGetAllArticles()
  onServerPrefetch(() => allArticles)
  const source = computed(() => allArticles.data.value?.slice() ?? [])
  return extendRef(source, { promise: allArticles as unknown as Promise<void> })
}

export function useFillArticles(
  count: number,
  conditionInput?: ConditionInput[],
  { cacheKey: userCacheKey, _conditionID }: { cacheKey?: string; _conditionID?: string } = {},
) {
  hookFillInUsing()
  const { conditions, identity } = _conditionID
    ? { identity: _conditionID, conditions: conditionInput as Condition[] }
    : normalizeCondition(conditionInput)
  const alreadyUsed = getAlreadyUsed()
  const sourceCursor = getSourceCursor()
  let cacheKey: Promisable<string> = userCacheKey ?? createAutoCacheKey(conditions, alreadyUsed)
  let source: MaybeRef<UseArticleReturn[]>
  let promise = Promise.resolve()
  if (process.server) {
    source = sourceCursor.get(identity)!
    if (!source) {
      const all = _getAllArticles()
      promise = all.promise
      cacheKey = promise.then(() => userCacheKey ?? createAutoCacheKey(conditions, alreadyUsed))
      source = all
    }
  } else {
    source = _getAllArticles()
  }
  const articles = useStaticAsyncState(cacheKey, async () => {
    await promise
    return getFillArticles({ count, conditions, identity, used: alreadyUsed, sourceCursor }, unref(source))
  })

  if (process.client) {
    if (!articles.value) {
      warn('cache key mismatch, please consider using `cacheKey` option to avoid this warning')
      articles.value = []
    } else {
      for (const article of articles.value) {
        alreadyUsed.add(article.id)
      }
    }
  }

  return {
    articles,
  }
}

function createAutoCacheKey(condition: Condition[], alreadyUsed = getAlreadyUsed()) {
  return `fill-article-${hash({
    condition,
    used: alreadyUsed,
  })}`
}

interface UseArticleLoaderInput<UseChunk extends false | number> {
  chunk: UseChunk
  preload?: number
  condition?: ConditionInput[]
  exclude?: string[]
  exhaustedPolicy?: 'stop' | 'show-unmatched'
}

interface UseArticleLoaderReturn<
  UseChunk extends false | number,
  ReturnValue = UseChunk extends false ? Article : Article[],
> {
  preload: Ref<Article[]>
  createLoadMore: () => AsyncGenerator<ReturnValue, void, unknown>
  loadMore: () => Promise<IteratorResult<ReturnValue>>
}

export function useArticleLoader<UseChunk extends false | number>({
  chunk,
  condition: conditionInput = usePageMetaAsCondition(),
  preload = chunk || 0,
  exclude = usePageMetaAsExclude(),
  exhaustedPolicy = 'stop',
}: UseArticleLoaderInput<UseChunk>): UseArticleLoaderReturn<UseChunk> {
  const { identity, conditions } = normalizeCondition(conditionInput)
  const { articles } = useFillArticles(preload, conditions, { _conditionID: identity })
  const hold: Article[] = []
  const alreadyUsed = getAlreadyUsed()
  const sourceCursor = getSourceCursor()

  async function* createLoadMore() {
    for (const id of [...articles.value.map(({ id }) => id), ...exclude]) {
      alreadyUsed.add(id)
    }
    const source = (await getAllArticles()).data.value ?? []
    while (source.length) {
      const { result: nextChunk, skip } = getFillArticlesWithSkip(
        { conditions, count: chunk || 1, used: alreadyUsed, sourceCursor },
        source,
      )
      if (exhaustedPolicy === 'show-unmatched') {
        hold.push(...skip)
      }
      if (nextChunk.length === 0) {
        break
      }

      if (chunk !== false) {
        yield nextChunk
      } else {
        yield nextChunk[0]
      }
    }

    if (exhaustedPolicy === 'stop') {
      return
    }

    const chunkNumber: number = typeof chunk === 'number' ? chunk : 1

    while (hold.length > 0) {
      const nextChunk = hold.splice(0, chunkNumber)

      if (chunk !== false) {
        yield nextChunk
      } else {
        yield nextChunk[0]
      }
    }
  }

  let generator: ReturnType<typeof createLoadMore>

  return {
    preload: articles,
    createLoadMore,
    loadMore(): Promise<IteratorResult<UseArticleReturn | UseArticleReturn[]>> {
      if (!generator) {
        generator = createLoadMore()
      }
      return generator.next()
    },
  } as unknown as UseArticleLoaderReturn<UseChunk>
}

function usePageMetaAsExclude() {
  const meta = useResourcePageMeta()
  if (meta.value?.type === 'article') {
    return [meta.value.meta.id]
  }
  return []
}

function getFillArticles(
  opts: {
    conditions: Condition[]
    count: number
    identity?: string
    used: Set<string>
    sourceCursor: Map<string, Article[]>
  },
  source: Article[],
  result: Article[] = [],
  skip: Article[] = [],
): Article[] {
  return getFillArticlesWithSkip(opts, source, result, skip).result
}

function getFillArticlesWithSkip(
  {
    conditions,
    count,
    identity,
    used,
    sourceCursor,
  }: {
    conditions: Condition[]
    count: number
    identity?: string
    used: Set<string>
    sourceCursor: Map<string, Article[]>
  },
  source: Article[],
  result: Article[] = [],
  skip: Article[] = [],
): { result: Article[]; skip: Article[] } {
  while (source.length !== 0 && result.length !== count) {
    const currentArticle = source.shift() as Article

    const verified = evaluateCondition(currentArticle, conditions)
    if (verified && !used.has(currentArticle.id)) {
      used.add(currentArticle.id)
      result.push(currentArticle)
    } else if (!used.has(currentArticle.id)) {
      skip.push(currentArticle)
    }
  }
  if (identity) {
    sourceCursor.set(identity, source)
  }
  return { result, skip }
}
