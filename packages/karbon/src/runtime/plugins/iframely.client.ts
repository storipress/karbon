// @ts-expect-error no type def
import * as embed from '@iframely/embed.js'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      iframely: {
        load() {
          embed.iframely.load()
        },
      },
    },
  }
})
