import type { UseAsyncStateReturn } from '@vueuse/core'
import { createInjectionState } from '@vueuse/core'
import invariant from 'tiny-invariant'
import { _useUniversalStoripressPayload } from '../../composables/storipress-payload'
import type { BaseMeta, UseArticleReturn } from '../../types'
import type { Segment } from '../../lib/split-article'
import {
  loadStoripressPayload,
  ref,
  shallowReadonly,
  useAsyncData,
  useFillArticles,
  useResourceResolver,
} from '#imports'

export { useSite } from '../../composables/site'

export function useGetArticle(id: string): UseAsyncStateReturn<any, [], true> {
  return _useUniversalStoripressPayload('posts', id)
}

const advertisingHandler = ref((segments: Segment[]) => segments)

export function useAdvertisingHandler(handler: (segments: Segment[]) => Segment[]) {
  advertisingHandler.value = handler
}

const [useProvideArticle, useOptionalArticle] = createInjectionState<[UseArticleReturn], UseArticleReturn>((article) =>
  shallowReadonly({
    ...article,
    segments: advertisingHandler.value(article.segments ?? []),
  })
)

export { useProvideArticle, useOptionalArticle }

export function useArticle() {
  const res = useOptionalArticle()
  invariant(res, 'must wrap in useProviderArticle')
  return res
}

type Article = UseArticleReturn

type ArticleWithURL = Article & { url: string }

export interface RecommendArticleOptions {
  count: number
  cacheKey?: string
}

export function getRelevancesArticles(article: Article, options: RecommendArticleOptions) {
  const { count } = options
  const { relevances } = article
  const relevancesArticlesPromise = (relevances ?? []).slice(0, count).map(async ({ id }): Promise<ArticleWithURL> => {
    const article = await loadStoripressPayload<Article>('posts', id)
    return enhanceArticleWithURL(article)
  })
  return Promise.all(relevancesArticlesPromise)
}

export function useRecommendArticle(article: Article, options: RecommendArticleOptions) {
  const { count } = options
  const baseCacheKey = `recommend-${article.id}-${count}`
  const { articles: fillArticles } = useFillArticles(count, [{ key: 'id', value: article.id }], {
    cacheKey: options.cacheKey || `${baseCacheKey}-fill`,
  })
  const { data } = useAsyncData(
    baseCacheKey,
    async () => {
      const relevancesArticles = await getRelevancesArticles(article, options)
      const alreadyRecommend = new Set<string>(relevancesArticles.map(({ id }) => id))
      const extraArticles = fillArticles.value
        .filter(({ id }) => !alreadyRecommend.has(id))
        .map((article) => enhanceArticleWithURL(article))

      const recommendArticles = [...relevancesArticles, ...extraArticles]

      return recommendArticles.slice(0, count)
    },
    {
      default: () => [],
      watch: [fillArticles],
    }
  )

  return data
}

function enhanceArticleWithURL(article: Article) {
  const { _resolveFromMetaSync } = useResourceResolver()
  const res = _resolveFromMetaSync('article', article as unknown as BaseMeta)
  invariant(res, 'impossible to resolve fail')
  return {
    ...article,
    url: res.url,
  }
}
