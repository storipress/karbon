import { storipressConfigCtx } from '../composables/storipress-base-client'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin((_nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  storipressConfigCtx.set(runtimeConfig.storipress)
})
