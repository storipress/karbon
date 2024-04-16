export { computed, onServerPrefetch, ref, unref } from 'vue'
export { useStaticAsyncState, useStaticState } from '../runtime/composables/storipress-payload'

function notImplemented(name: string) {
  return () => {
    throw new Error(`Not implement: ${name}`)
  }
}

export const useAsyncData = notImplemented('useAsyncData')
export const useNuxtApp = notImplemented('useNuxtApp')
export const useRuntimeConfig = () => ({
  storipress: {
    apiHost: 'api.stori.press',
    clientId: 'client_id',
  },
})
