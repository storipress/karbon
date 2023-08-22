import { useNuxtApp, useRuntimeConfig } from '#imports'

export function useDecryptClient<T>() {
  const nuxt = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()

  return (key: string) => {
    // encode as base64 to prevent error in http header
    const auth = btoa(JSON.stringify(nuxt.$paywall.authInfo.value))
    const siteCDN = runtimeConfig.public?.siteCDN || ''
    return runtimeConfig.public?.storipress?.paywall?.enable
      ? ($fetch(`${siteCDN}/api/decrypt-key`, {
          method: 'POST',
          body: {
            auth,
            key,
          },
        }) as Promise<T>)
      : Promise.resolve({ pass: false, message: 'paywall is disable' })
  }
}
