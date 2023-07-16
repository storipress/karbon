import { definePayloadHandler, getDesk, listDesks } from '@storipress/karbon/internal'

// @ts-expect-error no type
import { defineCachedEventHandler } from '#imports'

export default defineCachedEventHandler(
  definePayloadHandler({
    listAll: listDesks,
    getOne: getDesk,
  }),
)
