import { useNuxtApp, useRuntimeConfig } from '#imports'

interface UseSearchClientInput {
  /**
   * Fields for query, this is a comma separated string
   */
  queryBy?: string
  /**
   * API key, this will override the key in runtimeConfig
   */
  apiKey?: string
}

export function useSearchClient(params: UseSearchClientInput = {}) {
  const { queryBy, apiKey } = params
  const { TypesenseInstantsearchAdapter } = useNuxtApp().$storipressInternal
  const typesenseInstantsearchAdapter = new TypesenseInstantsearchAdapter({
    server: {
      apiKey: apiKey || useRuntimeConfig().public.storipress.searchKey,
      nodes: [
        {
          host: useRuntimeConfig().public.storipress.searchDomain || 'search.stori.press',
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
  return { searchClient, indexName: useRuntimeConfig().public.storipress.clientId }
}
