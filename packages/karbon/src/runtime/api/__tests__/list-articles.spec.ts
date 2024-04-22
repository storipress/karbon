import '@storipress/karbon-utils/polyfill'

import { afterAll, describe, expect, it } from 'vitest'
import type { StrictResponse } from 'msw'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import type { MultiSearchResponse, SearchResponse } from '@storipress/typesense-xior'
import { SearchClient } from '@storipress/typesense-xior'
import { createHooks } from 'hookable'
import { times } from 'remeda'
import { listArticlesFromTypesense } from '../list-articles'
import type { TypesenseArticleLike } from '../normalize-article'
import { mockTypesenseArticle } from './article.mock'

const server = setupServer(
  // single query handler
  http.get(
    'https://search.stori.press/collections/articles/documents/search',
    (): StrictResponse<SearchResponse<TypesenseArticleLike>> => {
      const document = mockTypesenseArticle
      return HttpResponse.json({
        found: 100,
        page: 1,
        out_of: 100,
        request_params: {},
        search_time_ms: 0,
        hits: [
          {
            document,
            highlight: {},
            text_match: 0,
          },
        ],
      })
    },
  ),
  http.post(
    'https://search.stori.press/multi_search',
    async ({ request }): Promise<StrictResponse<MultiSearchResponse<TypesenseArticleLike[]>>> => {
      const queries = (await request.json()) as { searches: unknown[] }
      const document = mockTypesenseArticle
      return HttpResponse.json({
        results: times(queries.searches.length, () => ({
          found: 100,
          page: 1,
          out_of: 100,
          request_params: {},
          search_time_ms: 0,
          hits: [
            {
              document,
              highlight: {},
              text_match: 0,
            },
          ],
        })),
      })
    },
  ),
)

server.listen()

afterAll(() => server.close())

describe('listArticlesFromTypesense', () => {
  it('should return articles', async () => {
    const typesenseClient = new SearchClient({
      apiKey: 'mock_key',
      nodes: [{ host: 'search.stori.press', port: 443, protocol: 'https' }],
    })

    const articles = await listArticlesFromTypesense({
      typesenseClient,
      hooks: createHooks(),
      filter: undefined,
      getArticles: (res) => res.hits?.map((x) => x.document) ?? [],
      getSearchQuery: () => ({ q: '*' }),
      query: {
        q: '*',
        query_by: 'title',
      },
      site: 'site',
      batchSize: 3,
      perPage: 20,
    })

    expect(articles).toBeDefined()
    expect(articles).toHaveLength(5)
  })
})
