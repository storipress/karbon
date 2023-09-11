import { decodeHTML } from 'entities'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      entities: {
        decode: decodeHTML,
      },
    },
  }
})
