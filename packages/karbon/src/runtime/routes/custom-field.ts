import { CUSTOM_FIELD_KEY, defineSnapshotHandler } from '@storipress/karbon/internal'
// @ts-expect-error noreason
import { defineCachedEventHandler } from '#imports'

export default defineCachedEventHandler(
  defineSnapshotHandler({
    fixedName: '_custom-field',
    handler: async () => {
      return { [CUSTOM_FIELD_KEY]: {} }
    },
  })
)
