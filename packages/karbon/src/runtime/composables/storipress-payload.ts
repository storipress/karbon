import type { UseAsyncStateReturn } from '@vueuse/core'
import { useAsyncState } from '@vueuse/core'
import type { Ref, UnwrapRef } from 'vue'
import { withBase } from 'ufo'
import type { Promisable } from 'type-fest'
import { isPromise } from 'remeda'
import type { PayloadScope } from '../types'
import { verboseInvariant } from '../utils/verbose-invariant'
import { computed, onServerPrefetch, ref, useAsyncData, useNuxtApp, useRuntimeConfig } from '#imports'

export interface FetchPayloadResult<T> {
  data: T
}

export async function loadStoripressPayload<T>(scope: PayloadScope, name: string): Promise<T> {
  return loadStoripressPayloadWithRawURL(getScopedModulePath(scope, name))
}

export async function loadStoripressPayloadWithURL(path: string) {
  return loadStoripressPayloadWithRawURL(getModulePath(path))
}

async function loadStoripressPayloadWithRawURL(path: string) {
  if (process.server) {
    return loadStoripressPayloadWithURLServer(path)
  }
  const { public: publicConfig } = useRuntimeConfig()
  const modulePath = publicConfig.storipress?.payloadAbsoluteURL ? withBase(path, publicConfig.siteUrl) : path
  const mod = await import(/* @vite-ignore */ modulePath)
  return mod.default
}

export function useStoripressPayload<T>(scope: PayloadScope, name: string): UseAsyncStateReturn<T, [], true> {
  const nuxtApp = useNuxtApp()
  const promise = loadStoripressPayload<T>(scope, name)

  return useAsyncState(promise, (nuxtApp.$storipressPayload.cache.get(`${scope}:${name}`) ?? null) as T, {
    shallow: true,
  })
}

export function useStaticState<T>(key: string, factory: () => T): Ref<UnwrapRef<T>> {
  const nuxt = useNuxtApp()
  const dataKey = `sp$$static$${key}`

  if (process.server) {
    const data = factory()
    nuxt.payload.data[dataKey] = data
    return ref(data)
  }

  return computed(() => {
    return nuxt.$storipressPayload.static.value[dataKey] as UnwrapRef<T>
  })
}

export function useStaticAsyncState<T>(key: Promisable<string>, factory: () => Promise<T>): Ref<UnwrapRef<T>> {
  const nuxt = useNuxtApp()

  if (process.server) {
    const promise = factory()
    const res = ref()
    onServerPrefetch(async () => {
      const k = await key
      const dataKey = `sp$$static$a$${k}`
      const data = await promise
      nuxt.payload.data[dataKey] = data
      res.value = data
    })
    return res
  }

  verboseInvariant(process.client && !isPromise(key as string), 'only server is allow to have promise key')
  const dataKey = `sp$$static$a$${key}`

  return computed(() => {
    return nuxt.$storipressPayload.static.value[dataKey] as UnwrapRef<T>
  })
}

export function _useUniversalStoripressPayload<T>(scope: PayloadScope, name: string): UseAsyncStateReturn<T, [], true> {
  if (process.client) {
    return useStoripressPayload(scope, name)
  } else {
    const promise = loadStoripressPayloadWithURLServer(getScopedModulePath(scope, name))
    saveDataToPayload(scope, name, promise)
    // Safety: data is promised to load by onServerPrefetch
    return useAsyncState(promise, null as any)
  }
}

function saveDataToPayload(scope: string, name: string, promise: Promise<unknown>) {
  const cacheKey = `${scope}:${name}`
  const asyncDataKey = `sp$$payload$${cacheKey}`
  const nuxtApp = useNuxtApp()
  useAsyncData(asyncDataKey, () => Promise.resolve({ scope, name }))
  onServerPrefetch(async () => {
    const data = await promise
    nuxtApp.$storipressPayload.cache.set(cacheKey, data)
  })
}

function getScopedModulePath(scope: string, name: string) {
  return getModulePath(`${scope}/${name}`)
}

function getModulePath(path: string) {
  return `/_storipress/${path}.js`
}

async function loadStoripressPayloadWithURLServer<T>(url: string): Promise<T> {
  verboseInvariant(process.server, `This function only allow to run in server side: ${url}`)
  const res = await $fetch(url.replace(/\.js$/, '.json'))
  return res as T
}
