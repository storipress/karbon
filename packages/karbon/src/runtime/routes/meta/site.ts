import { defineSnapshotHandler, getSite, storipressConfigCtx } from '@storipress/karbon/internal'

// @ts-expect-error noreason
import { defineCachedEventHandler, useRuntimeConfig } from '#imports'

storipressConfigCtx.set(useRuntimeConfig().storipress)

export default defineCachedEventHandler(
  defineSnapshotHandler({
    fixedName: '_site',
    handler: async () => getSite(),
  })
)
