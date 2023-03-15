import type { FieldStorage } from '@storipress/custom-field'
import { globalCustomFieldCtx, storageCtx, storageHooks } from '@storipress/custom-field'
import { CUSTOM_FIELD_KEY } from '../constants'
import { loadStoripressPayloadWithURL } from '../composables/storipress-payload'
import { META_KEY } from './storipress'
import { defineNuxtPlugin, useRequestEvent, useRouter, useStaticState } from '#imports'

const GLOBAL_CUSTOM_FIELD_KEY = 'global-custom-field'

// defineCachedEventHandler
// Must run after storipress plugin
export default defineNuxtPlugin(async () => {
  const router = useRouter()
  if (process.server) {
    const globalCustomField = ((await loadStoripressPayloadWithURL('_custom-field')) || {})[CUSTOM_FIELD_KEY]
    const event = useRequestEvent()

    // must add at here as every page should have global custom field
    globalCustomFieldCtx.set(globalCustomField, true)
    useStaticState(GLOBAL_CUSTOM_FIELD_KEY, () => globalCustomField)

    storageHooks.hook('field:read', () => {
      const pageMeta = event.context[META_KEY]?.meta
      const customField = { ...globalCustomField, ...pageMeta?.[CUSTOM_FIELD_KEY] }
      setStorage(customField)
      useStaticState('custom-field', () => customField)
    })
  }

  if (process.client) {
    router.afterEach(() => {
      const globalCustomField = useStaticState<Record<string, unknown>>(GLOBAL_CUSTOM_FIELD_KEY, () => {
        throw new Error('Fail to read custom field')
      })
      globalCustomFieldCtx.set(globalCustomField.value || {}, true)

      const customFieldValues = useStaticState<FieldStorage>('custom-field', () => {
        throw new Error('Fail to read custom field')
      })
      setStorage(customFieldValues.value)
    })
  }
})

function setStorage(storage: FieldStorage) {
  storageCtx.set({ s: storage, a: null as any }, true)
}
