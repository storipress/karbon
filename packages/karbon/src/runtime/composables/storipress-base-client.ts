import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core/index.js'
import { setContext } from '@apollo/client/link/context/index.js'
import { fetch } from 'cross-fetch'
import type { ModuleRuntimeConfig } from '../types'

function getUserAgent() {
  if (process.server) {
    return { 'user-agent': 'karbon/1.0.0' }
  }

  return {}
}

let c: any = null

export const storipressConfigCtx = {
  use: () => {
    return c
  },
  set: (config: any) => {
    return (c = config)
  },
}

export function getStoripressConfig(): ModuleRuntimeConfig['storipress'] {
  try {
    const { storipress } = useRuntimeConfig()
    // @ts-expect-error type error
    return storipress
  } catch {
    return storipressConfigCtx.use()
  }
}

export function createStoripressBaseClient(getHeaders: () => Record<string, string | null | undefined>, uri: string) {
  const authLink = setContext(() => {
    return {
      headers: { ...getUserAgent(), ...getHeaders() },
    }
  })

  const httpLink = new HttpLink({
    fetch,
    uri,
  })

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        CustomField: {
          keyFields: false,
        },
        CustomFieldColorValue: {
          keyFields: false,
        },
      },
    }),
  })
}
