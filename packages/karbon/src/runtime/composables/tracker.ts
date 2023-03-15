import { useNuxtApp } from '#imports'

export function useTracker() {
  return useNuxtApp().$tracker
}
