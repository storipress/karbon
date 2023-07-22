import type { SearchAdapterConstructor, UseSearchClientInput } from './lazy-search-client'
import { _createSearchClient } from './lazy-search-client'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export function useSearchClient(params: UseSearchClientInput = {}) {
  const { TypesenseInstantsearchAdapter } = useNuxtApp().$storipressSearchClient
  const searchClient = _createSearchClient(TypesenseInstantsearchAdapter as SearchAdapterConstructor, params)
  return { searchClient, indexName: useRuntimeConfig().public.storipress.clientId }
}
