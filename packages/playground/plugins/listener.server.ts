export default defineNuxtPlugin(() => {
  const nuxt = useNuxtApp()
  nuxt.hooks.hook('karbon:request', (ctx) => {
    console.log('nuxt request', ctx)
  })
  nuxt.hooks.hook('karbon:response', (ctx) => {
    console.log('nuxt response', ctx)
  })
  nuxt.hooks.hook('karbon:searchRequest', (ctx) => {
    console.log('nuxt searchRequest', ctx)
  })
  nuxt.hooks.hook('karbon:searchResponse', (ctx) => {
    console.log('nuxt searchResponse', ctx)
  })
})
