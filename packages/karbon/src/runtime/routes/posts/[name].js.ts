import { definePayloadHandler, getArticle, listArticles } from '@storipress/karbon/internal'
import { hash } from 'ohash'

// @ts-expect-error no type
import { cachedFunction, defineCachedEventHandler } from '#imports'

interface HasUpdatedAt {
  updated_at: string
}

export default defineCachedEventHandler(
  definePayloadHandler({
    listAll: cachedFunction(listArticles, {
      name: 'article-list',
      swr: true,
      maxAge: 60,
      staleMaxAge: 60,
    }),
    getOne: cachedFunction(getArticle, {
      name: 'article',
      swr: true,
      maxAge: 60,
      staleMaxAge: 60,
    }),
    listHash: (items: HasUpdatedAt[]) => {
      return hash(items.map((item) => item.updated_at))
    },
  }),
)
