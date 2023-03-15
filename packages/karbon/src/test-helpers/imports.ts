export { computed, onServerPrefetch, ref, unref } from 'vue'
export { useStaticAsyncState, useStaticState } from '../runtime/composables/storipress-payload'

const notImplemented = (name: string) => () => {
  throw new Error(`Not implement: ${name}`)
}

export const useAsyncData = notImplemented('useAsyncData')
export const useNuxtApp = notImplemented('useNuxtApp')
export const useRuntimeConfig = notImplemented('useRuntimeConfig')
