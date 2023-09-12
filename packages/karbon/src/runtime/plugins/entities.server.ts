import { decodeHTML } from 'entities'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      entities: {
        decode: decodeHTML,
      },
    },
  }
})
