import { addComponent, defineNuxtModule, resolvePath } from '@nuxt/kit'

export default defineNuxtModule({
  async setup() {
    const widgetSource = await resolvePath('vue-instantsearch/vue3/es/src/widgets')
    const promises = []
    // @ts-expect-error internal pkg
    const widgets = await import('vue-instantsearch/vue3/es/src/widgets.js')
    for (const name of Object.keys(widgets)) {
      promises.push(
        addComponent({
          filePath: widgetSource,
          name,
          export: name,
          chunkName: 'instantsearch',
        }),
      )
    }
    await Promise.all(promises)
  },
})
