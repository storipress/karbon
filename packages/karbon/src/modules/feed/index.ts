import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
export type ModuleOptions = boolean

export default defineNuxtModule({
  meta: {
    name: 'karbon/feed',
    configKey: 'feed',
  },
  defaults: {},
  setup(_) {
    const { resolve } = createResolver(import.meta.url)

    addServerHandler({
      route: '/atom.xml',
      handler: resolve('./runtime/routes/atom.xml'),
    })
  },
})
