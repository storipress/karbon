import { withoutProtocol } from 'ufo'
import type TypesenseInstantsearchAdapter from 'typesense-instantsearch-adapter'
import { tryOnMounted } from '@vueuse/core'
import { waitIdle } from '../utils/idle-promise'
import { shallowRef, useRuntimeConfig } from '#imports'

export type SearchAdapterConstructor = typeof TypesenseInstantsearchAdapter

export interface UseSearchClientInput {
  /**
   * Fields for query, this is a comma separated string
   */
  queryBy?: string
  /**
   * API key, this will override the key in runtimeConfig
   */
  apiKey?: string
}

export function useLazySearchClient(params: UseSearchClientInput = {}) {
  const searchClient = shallowRef()
  tryOnMounted(async () => {
    await waitIdle()
    const adapterModule = await import('typesense-instantsearch-adapter')
    const Adapter: SearchAdapterConstructor = adapterModule.default

    searchClient.value = _createSearchClient(Adapter, params)
  })

  return {
    searchClient,
    indexName: useRuntimeConfig().public.storipress.clientId,
  }
}

export function _createSearchClient(Adapter: SearchAdapterConstructor, params: UseSearchClientInput = {}) {
  const { queryBy, apiKey } = params
  const typesenseInstantsearchAdapter = new Adapter({
    server: {
      apiKey: apiKey || useRuntimeConfig().public.storipress.searchKey,
      nodes: [
        {
          host: withoutProtocol(useRuntimeConfig().public.storipress.searchDomain) || 'search.stori.press',
          port: 443,
          protocol: 'https',
        },
      ],
    },
    additionalSearchParameters: {
      query_by: queryBy || 'title',
    },
  })
  const { searchClient } = typesenseInstantsearchAdapter
  return searchClient
}
