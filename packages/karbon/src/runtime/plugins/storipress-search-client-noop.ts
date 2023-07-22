import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      storipressSearchClient: {
        TypesenseInstantsearchAdapter: class {
          searchClient = {}
          constructor() {
            throw new Error('`useSearchClient` is not supported when lazySearch enabled')
          }
        },
      },
    },
  }
})
