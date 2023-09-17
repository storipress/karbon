import { addRouteMiddleware, defineNuxtPlugin, defineNuxtRouteMiddleware, getSite } from '#imports'

const setHtmlLang = defineNuxtRouteMiddleware(async () => {
  const site = await getSite()
  useHead({
    htmlAttrs: {
      lang: site.lang,
    },
  })
})

export default defineNuxtPlugin(async () => {
  if (process.client) return

  addRouteMiddleware('set-html-lang', setHtmlLang, { global: true })
})
