import type { NormalizedCacheObject } from '@apollo/client/core/index.js'
import { useStorage } from '@vueuse/core'
import { createContext } from 'unctx'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client/core/index.js'
import type { Apollo } from './storipress-base-client'
import { createStoripressBaseClient, getStoripressConfig } from './storipress-base-client'

const apollo = {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
}

export function createStoripressClient() {
  const storipress = getStoripressConfig()
  return createStoripressBaseClient(
    apollo,
    () => ({
      authorization: `Bearer ${storipress?.apiToken}`,
    }),
    getUri(),
    { name: 'storipress' },
  )
}

export const storipressClientCtx = createContext<ApolloClient<NormalizedCacheObject>>()

let client: ApolloClient<NormalizedCacheObject>
export function useStoripressClient() {
  const globalClient = storipressClientCtx.tryUse()
  if (globalClient) {
    return globalClient
  }
  client ??= createStoripressClient()
  return client
}

export function createSubscriberClient(apollo: Apollo) {
  const authorization = () => {
    const token = useStorage('storipress-token', '')
    return {
      authorization: token.value ? `Bearer ${token.value}` : null,
    }
  }

  return createStoripressBaseClient(apollo, authorization, getUri(), { name: 'storipress-subscriber' })
}

export function getUri() {
  const storipress = getStoripressConfig()
  return `${storipress?.apiHost}/client/${storipress?.clientId}/graphql`
}
