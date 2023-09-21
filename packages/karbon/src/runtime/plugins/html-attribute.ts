import { addRouteMiddleware, defineNuxtPlugin, defineNuxtRouteMiddleware, getSite, useHead, useNuxtApp } from '#imports'

const setHtmlLang = defineNuxtRouteMiddleware(async () => {
  const nuxt = useNuxtApp()
  const site = await getSite()
  nuxt.runWithContext(() => {
    useHead({
      htmlAttrs: {
        lang: site.lang,
      },
    })
  })
})

export default defineNuxtPlugin(async () => {
  if (process.client) return

  addRouteMiddleware('set-html-lang', setHtmlLang, { global: true })
})
