import { createStoripressClient, createSubscriberClient, storipressClientCtx } from '../composables/storipress-client'
import { storipressConfigCtx } from '../composables/storipress-base-client'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin((_nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  storipressConfigCtx.set({ ...runtimeConfig.public.storipress, ...runtimeConfig.storipress })

  const apolloClient = createStoripressClient()
  const subscriberClient = createSubscriberClient()

  storipressClientCtx.set(apolloClient, true)

  return {
    provide: {
      storipress: {
        client: apolloClient,
        subscriberClient,
      },
    },
  }
})
