import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const {
    public: {
      storipress: { clientId },
    },
  } = useRuntimeConfig()

  // @ts-expect-error inject global
  globalThis.__storipress = { clientId }
})
