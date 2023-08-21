import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('karbon:request', (ctx) => {
    console.log('nitro request', ctx)
  })
  nitro.hooks.hook('karbon:response', (ctx) => {
    console.log('nitro response', ctx)
  })
})
