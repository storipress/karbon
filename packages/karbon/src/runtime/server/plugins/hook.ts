import { clientHooks } from '@storipress/karbon/internal'
import type { _karbonClientHooks } from '../../composables/storipress-base-client'
import { defineNitroPlugin } from '#imports'

const hooks: typeof _karbonClientHooks = clientHooks

export default defineNitroPlugin((nitro) => {
  hooks.hook('karbon:request', (ctx) => {
    return nitro.hooks.callHookParallel('karbon:request', ctx)
  })
  hooks.hook('karbon:response', (ctx) => {
    return nitro.hooks.callHookParallel('karbon:response', ctx)
  })
  hooks.hook('karbon:searchRequest', (ctx) => {
    return nitro.hooks.callHookParallel('karbon:searchRequest', ctx)
  })
  hooks.hook('karbon:searchResponse', (ctx) => {
    return nitro.hooks.callHookParallel('karbon:searchResponse', ctx)
  })
})
