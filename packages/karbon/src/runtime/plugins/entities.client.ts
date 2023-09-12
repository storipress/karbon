import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      entities: {
        decode: (html: string) => {
          const textarea = document.createElement('textarea')
          textarea.innerHTML = html
          return textarea.value
        },
      },
    },
  }
})
