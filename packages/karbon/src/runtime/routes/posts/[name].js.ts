import {
  definePayloadHandler,
  getArticle,
  listArticles,
  shouldBypassCache,
  shouldInvalidCache,
} from '@storipress/karbon/internal'
import { hash } from 'ohash'

// @ts-expect-error no type
import { cachedFunction, defineCachedEventHandler } from '#imports'

interface HasUpdatedAt {
  updated_at: string
}

interface CacheEntry<T = any> {
  value?: T
}

export default defineCachedEventHandler(
  definePayloadHandler({
    listAll: cachedFunction(listArticles, {
      name: 'article-list',
      swr: true,
      maxAge: 60,
      staleMaxAge: 10,
      getKey: () => 'index',
    }),
    getOne: cachedFunction(getArticle, {
      name: 'article',
      swr: true,
      maxAge: 60,
      staleMaxAge: 10,
      getKey: (id: string) => id,
      validate: (item: CacheEntry) => {
        return Boolean(item.value)
      },
    }),
    listHash: (items: HasUpdatedAt[]) => {
      return hash(items.map((item) => item.updated_at))
    },
  }),
  {
    shouldBypassCache,
    shouldInvalidCache,
  },
)
