import { definePayloadHandler, getArticle, listArticles } from '@storipress/karbon/internal'

// @ts-expect-error no type
import { defineCachedEventHandler } from '#imports'

export default defineCachedEventHandler(
  definePayloadHandler({
    listAll: listArticles,
    getOne: getArticle,
  }),
)
