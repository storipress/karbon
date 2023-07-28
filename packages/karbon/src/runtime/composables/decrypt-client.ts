import { DECRYPT_AUTH_HEADER, DECRYPT_KEY_HEADER } from '../constants'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export function useDecryptClient<T>() {
  const nuxt = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()

  return (key: string) => {
    // encode as base64 to prevent error in http header
    const auth = btoa(JSON.stringify(nuxt.$paywall.authInfo.value))
    return runtimeConfig.public?.storipress?.paywall?.enable
      ? ($fetch('/api/decrypt-key', {
          method: 'GET',
          headers: {
            [DECRYPT_AUTH_HEADER]: auth,
            [DECRYPT_KEY_HEADER]: key,
            'content-type': 'text/plain',
          },
        }) as Promise<T>)
      : Promise.resolve({ pass: false, message: 'paywall is disable' })
  }
}
