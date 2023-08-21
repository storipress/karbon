export default defineNuxtPlugin(() => {
  const nuxt = useNuxtApp()
  nuxt.hooks.hook('karbon:request', (ctx) => {
    console.log('nuxt request', ctx)
  })
  nuxt.hooks.hook('karbon:response', (ctx) => {
    console.log('nuxt response', ctx)
  })
})
