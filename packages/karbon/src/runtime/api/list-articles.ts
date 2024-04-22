import { destr } from 'destr'
import type { MultiSearchResponse, SearchClient, SearchParams, SearchResponse } from '@storipress/typesense-xior'
import { filter as arrayFilter, chunk, flatMap, map, pipe, times } from 'remeda'
import type { Hookable } from 'hookable'
import type { TypesenseFilter } from '../composables/typesense-client'
import type { ClientHookable } from '../composables/storipress-base-client'
import type { TypesenseArticleLike } from './normalize-article'

const QUERY_BATCH_SIZE = 50
const PER_PAGE = 100

export interface ListArticlesFromTypesenseInput<T> {
  typesenseClient: SearchClient
  hooks: ClientHookable
  query: SearchParams
  site: string
  filter: TypesenseFilter | undefined
  perPage?: number
  batchSize?: number
  getSearchQuery: (page: number, filter?: TypesenseFilter) => SearchParams
  getArticles: (typesenseArticle: SearchResponse<TypesenseArticleLike>) => T[]
}

export async function listArticlesFromTypesense<T>({
  typesenseClient,
  hooks,
  query,
  site,
  filter,
  getArticles,
  getSearchQuery,
  perPage = PER_PAGE,
  batchSize = QUERY_BATCH_SIZE,
}: ListArticlesFromTypesenseInput<T>): Promise<T[]> {
  const groupId = crypto.randomUUID()
  const name = 'listArticles'
  const articles: T[] = []
  const groupStartTime = Date.now()
  const id = crypto.randomUUID()

  const documents = typesenseClient.collections<TypesenseArticleLike>('articles').documents()

  const ctx = { name, id, groupId, query, site, groupStartTime, isFirstRequest: true, requestTime: Date.now() }
  hooks.callHookParallel('karbon:searchRequest', ctx)

  // `destr` is workaround for fetch adapter not automatically parse response
  const rawSearchResult = await documents.search(query, {}).catch((error: Error) => {
    hooks.callHookParallel('karbon:searchResponse', {
      ...ctx,
      type: 'error',
      responseTime: Date.now(),
      hasMore: true,
      error,
    })
    throw error
  })
  const searchResult = destr<SearchResponse<TypesenseArticleLike>>(rawSearchResult)

  const currentPageArticles = getArticles(searchResult)
  articles.push(...currentPageArticles)

  const hasMore = searchResult.found > searchResult.page * perPage

  hooks.callHookParallel('karbon:searchResponse', {
    ...ctx,
    type: 'complete',
    hasMore,
    responseTime: Date.now(),
  })

  if (hasMore) {
    const totalPage = Math.ceil(searchResult.found / perPage)
    // `index + 2` is used to skip the first page.
    // Assuming `totalPage === 3` , it will query [2, 3] pages.
    const chunkedSearches = pipe(
      times(totalPage - 1, (index) => getSearchQuery(index + 2, filter)),
      chunk(batchSize),
    )

    const multiSearchCtx = {
      ...ctx,
      hasMore: false,
      isFirstRequest: false,
      requestTime: Date.now(),
    }
    hooks.callHookParallel('karbon:searchRequest', multiSearchCtx)

    const rawMultiSearchSettledResult = await pipe(
      chunkedSearches,
      map((searches) => {
        const id = crypto.randomUUID()
        hooks.callHookParallel('karbon:searchRequest', { ...multiSearchCtx, id, query: searches })

        return typesenseClient.multiSearch.perform<TypesenseArticleLike[]>({ searches }).catch((error: Error) => {
          hooks.callHookParallel('karbon:searchResponse', {
            ...multiSearchCtx,
            id,
            type: 'error',
            responseTime: Date.now(),
            error,
          })
          throw error
        })
      }),
      (promises) => Promise.allSettled(promises),
    )

    const multiSearchResults = pipe(
      rawMultiSearchSettledResult,
      arrayFilter(
        (result): result is PromiseFulfilledResult<MultiSearchResponse<TypesenseArticleLike[]>> =>
          result.status === 'fulfilled',
      ),
      map((result) => destr<MultiSearchResponse<TypesenseArticleLike[]>>(result.value)),
    )

    const otherArticles = pipe(
      multiSearchResults,
      flatMap((result) => result.results.flatMap((searchResult) => getArticles(searchResult))),
    )

    articles.push(...otherArticles)

    hooks.callHookParallel('karbon:searchResponse', {
      ...multiSearchCtx,
      type: 'complete',
      responseTime: Date.now(),
    })
  }

  return articles
}
