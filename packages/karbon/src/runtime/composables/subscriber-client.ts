import { useNuxtApp } from '#imports'

export function useSubscriberClient() {
  const { $storipress } = useNuxtApp()
  return $storipress.subscriberClient
}
