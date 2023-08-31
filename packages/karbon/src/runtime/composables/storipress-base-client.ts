import type { Operation } from '@apollo/client/core/index.js'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client/core/index.js'
import { setContext } from '@apollo/client/link/context/index.js'
import { fetch } from 'cross-fetch'
import { withHttps } from 'ufo'
import { Hookable } from 'hookable'
import type { Subscription } from 'zen-observable-ts'
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

type HookResult = Promise<void> | void

export const _karbonClientHooks = new Hookable<{
  'karbon:request': (ctx: RequestContext) => HookResult
  'karbon:response': (ctx: ResponseContext) => HookResult
}>()

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

export function createTenantURL(config: Pick<ModuleRuntimeConfig['storipress'], 'apiHost' | 'clientId'>) {
  return withHttps(`${config.apiHost}/client/${config.clientId}/graphql`)
}

export interface CreateBaseClientInput {
  name?: string
}

export function createStoripressBaseClient(
  getHeaders: () => Record<string, string | null | undefined>,
  uri: string,
  opt: CreateBaseClientInput = {},
) {
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
