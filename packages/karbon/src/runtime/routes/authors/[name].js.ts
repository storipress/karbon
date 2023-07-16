import { definePayloadHandler, getAuthor, listAuthors } from '@storipress/karbon/internal'

// @ts-expect-error no type
import { defineCachedEventHandler } from '#imports'

export default defineCachedEventHandler(
  definePayloadHandler({
    listAll: listAuthors,
    getOne: getAuthor,
  }),
)
