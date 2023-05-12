import { defineNuxtModule } from '@nuxt/kit'
import { initTrack, trackCommand, trackProject } from '../../track'

export type ModuleOptions = boolean

export default defineNuxtModule({
  meta: {
    name: 'karbon/telemetry',
    configKey: 'telemetry',
  },
  defaults: {},
  async setup(_, nuxt) {
    await initTrack('module')
    nuxt.hook('modules:done', async () => {
      trackCommand()
      trackProject(nuxt.options)
    })
  },
})
