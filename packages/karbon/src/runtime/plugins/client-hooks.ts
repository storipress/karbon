import { _karbonClientHooks } from '../composables/storipress-base-client'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  _karbonClientHooks.hook('karbon:request', async (ctx) => {
    await nuxt.hooks.callHookParallel('karbon:request', ctx)
  })

  _karbonClientHooks.hook('karbon:response', async (ctx) => {
    await nuxt.hooks.callHookParallel('karbon:response', ctx)
  })
  _karbonClientHooks.hook('karbon:searchRequest', async (ctx) => {
    await nuxt.hooks.callHookParallel('karbon:searchRequest', ctx)
  })

  _karbonClientHooks.hook('karbon:searchResponse', async (ctx) => {
    await nuxt.hooks.callHookParallel('karbon:searchResponse', ctx)
  })
})
