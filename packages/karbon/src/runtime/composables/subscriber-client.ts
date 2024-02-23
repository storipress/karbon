import { createSubscriberClient } from './storipress-client'
import type { Apollo } from './storipress-base-client'

export function useSubscriberClient() {
  type SubscriberClient = ReturnType<typeof createSubscriberClient>
  const subscriberClient = ref<SubscriberClient>()
  // const subscriberClient = ref()
  onMounted(async () => {
    const { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } = await import(
      '@apollo/client/core/index.js'
    )
    const apollo = {
      ApolloClient,
      ApolloLink,
      HttpLink,
      InMemoryCache,
      Observable,
    }
    subscriberClient.value = createSubscriberClient(apollo)
  })
  return subscriberClient
}
