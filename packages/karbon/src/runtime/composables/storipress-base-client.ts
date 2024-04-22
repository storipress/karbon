import type {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  Operation,
} from '@apollo/client/core/index.js'
import { setContext } from '@apollo/client/link/context/index.js'
import { fetch } from 'cross-fetch'
import { withHttps } from 'ufo'
import { Hookable } from 'hookable'
import type { Subscription } from 'zen-observable-ts'
import type { SearchParams, SearchParamsWithPreset } from '@storipress/typesense-xior'
import type { ModuleRuntimeConfig } from '../types'

let c: any = null

export interface RequestContext {
  name: string
  id: string
  operation: Operation
}

export interface ResponseContext {
  name: string
  id: string
  operation: Operation
  type: 'next' | 'error' | 'complete'
  data: any
}

export interface SearchRequestContext {
  id: string
  groupId: string
  name: string
  query: SearchParams | SearchParamsWithPreset | SearchParams[]
  site: string
  isFirstRequest: boolean
  requestTime: number
  groupStartTime: number
}

export interface SearchResponseContext extends SearchRequestContext {
  type: 'error' | 'complete'
  hasMore: boolean
  responseTime: number
  error?: Error
}

export type HookResult = Promise<void> | void

export interface ClientHooks {
  'karbon:request': (ctx: RequestContext) => HookResult
  'karbon:response': (ctx: ResponseContext) => HookResult
  'karbon:searchRequest': (ctx: SearchRequestContext) => HookResult
  'karbon:searchResponse': (ctx: SearchResponseContext) => HookResult
}

export type ClientHookable = Hookable<ClientHooks>

export const _karbonClientHooks: ClientHookable = new Hookable<ClientHooks>()

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
    return storipress ?? storipressConfigCtx.use()
  } catch {
    return storipressConfigCtx.use()
  }
}

export function createTenantURL(config: Pick<ModuleRuntimeConfig['storipress'], 'apiHost' | 'clientId'>) {
  return withHttps(`${config.apiHost}/client/${config.clientId}/graphql`)
}

export interface CreateBaseClientInput {
  name?: string
}

export interface Apollo {
  ApolloClient: typeof ApolloClient
  ApolloLink: typeof ApolloLink
  HttpLink: typeof HttpLink
  InMemoryCache: typeof InMemoryCache
  Observable: typeof Observable
}
export function createStoripressBaseClient(
  apollo: Apollo,
  getHeaders: () => Record<string, string | null | undefined>,
  uri: string,
  opt: CreateBaseClientInput = {},
) {
  const { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } = apollo
  const tapClient = new ApolloLink((operation, forward) => {
    const id = crypto.randomUUID()

    operation.setContext({
      karbonTracing: id,
    })

    return new Observable((observer) => {
      let subscription: Subscription
      let closed = false
      Promise.resolve(
        _karbonClientHooks.callHookParallel('karbon:request', {
          name: opt.name ?? 'unknown',
          operation,
          id,
        }),
      )
        .then(() => {
          if (closed) {
            return
          }

          function createCallback(type: 'next' | 'error' | 'complete', callback: (...args: any[]) => void) {
            return (...args: any[]) => {
              Promise.resolve(
                _karbonClientHooks.callHookParallel('karbon:response', {
                  name: opt.name ?? 'unknown',
                  operation,
                  id,
                  type,
                  data: args[0],
                }),
              )
                .then(() => callback(...args))
                .catch((err) => {
                  if (process.dev) {
                    console.error(err)
                  }
                })
            }
          }

          subscription = forward(operation).subscribe({
            next: createCallback('next', observer.next.bind(observer)),
            error: createCallback('error', observer.error.bind(observer)),
            complete: createCallback('complete', observer.complete.bind(observer)),
          })
        })
        .catch((err) => {
          observer.error(err)
        })

      return () => {
        closed = true
        if (subscription) {
          subscription.unsubscribe()
        }
      }
    })
  })
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
    link: ApolloLink.from([authLink, tapClient, httpLink]),
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

function getUserAgent() {
  if (process.server) {
    const config = getStoripressConfig()
    return { 'user-agent': config?.userAgent ?? 'karbon/1.0.0' }
  }

  return {}
}
