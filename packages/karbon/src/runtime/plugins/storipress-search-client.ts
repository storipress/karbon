import TypesenseInstantsearchAdapter from 'typesense-instantsearch-adapter'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      storipressSearchClient: {
        TypesenseInstantsearchAdapter: process.server
          ? class {
              searchClient = {}
            }
          : TypesenseInstantsearchAdapter,
      },
    },
  }
})
