import { createStoripressClient, createSubscriberClient, storipressClientCtx } from '../composables/storipress-client'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((_nuxtApp) => {
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
