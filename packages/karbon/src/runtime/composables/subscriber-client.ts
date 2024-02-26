import { createSubscriberClient } from './storipress-client'
import { ref } from '#imports'

export function useSubscriberClient() {
  type SubscriberClient = ReturnType<typeof createSubscriberClient>
  const subscriberClient = ref<SubscriberClient>()

  if (process.server) return subscriberClient

  async function createClient() {
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
  }
  createClient()
  return subscriberClient
}
