import * as vue from 'vue'
import * as vueuse from '@vueuse/core'
import * as serverRenderer from 'vue/server-renderer'
import * as customField from '@storipress/custom-field'
import * as components from '../components'
import * as utils from '../utils'

export function injectRequire(name: string) {
  const returnMapping: Record<string, any> = {
    vue,
    '@vueuse/core': vueuse,
    '@storipress/custom-field': customField,
    '@storipress/sdk/article/components': components,
    '@storipress/sdk/article/utils': utils,
    'vue/server-renderer': serverRenderer,
  }

  if (returnMapping[name]) {
    return returnMapping[name]
  }

  throw new Error('cannot find module')
}
