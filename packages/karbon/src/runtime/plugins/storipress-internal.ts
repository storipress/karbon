import TypesenseInstantsearchAdapter from 'typesense-instantsearch-adapter'
import defaultConfig from '#build/seo-presets.mjs'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      storipressInternal: {
        // should be a better cache + load more solution
        seoConfig: defaultConfig,
        TypesenseInstantsearchAdapter: process.server
          ? class {
              searchClient = {}
            }
          : TypesenseInstantsearchAdapter,
      },
    },
  }
})
