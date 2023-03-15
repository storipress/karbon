import type { ApolloClient, NormalizedCacheObject } from '@apollo/client/core/index.js'
import { useStorage } from '@vueuse/core'
import { createContext } from 'unctx'
import { createStoripressBaseClient, getStoripressConfig } from './storipress-base-client'

export function createStoripressClient() {
  const storipress = getStoripressConfig()
  return createStoripressBaseClient(
    () => ({
      authorization: `Bearer ${storipress?.apiToken}`,
    }),
    getUri()
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

export function createSubscriberClient() {
  const authorization = () => {
    const token = useStorage('storipress-token', '')
    return {
      authorization: token.value ? `Bearer ${token.value}` : null,
    }
  }

  return createStoripressBaseClient(authorization, getUri())
}

export function getUri() {
  const storipress = getStoripressConfig()
  return `${storipress?.apiHost}/client/${storipress?.clientId}/graphql`
}
