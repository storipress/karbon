import { useNuxtApp } from '#imports'

export function usePaywall() {
  return useNuxtApp().$paywall
}
