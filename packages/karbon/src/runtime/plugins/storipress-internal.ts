import defaultConfig from '#build/seo-presets.mjs'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      storipressInternal: {
        // should be a better cache + load more solution
        seoConfig: defaultConfig,
      },
    },
  }
})
