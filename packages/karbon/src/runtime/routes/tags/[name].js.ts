import { definePayloadHandler, getTag, listTags } from '@storipress/karbon/internal'

// @ts-expect-error no type
import { defineCachedEventHandler } from '#imports'

export default defineCachedEventHandler(
  definePayloadHandler({
    listAll: listTags,
    getOne: getTag,
  })
)
