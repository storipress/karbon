import { gql } from '@apollo/client/core/index.js'
import { getAllWithPagination } from './helper'
import type { RawArticleLike } from './normalize-article'
import { normalizeArticle } from './normalize-article'

const ListArticles = gql`
  query ListArticles($page: Int!) {
    articles(page: $page) {
      paginatorInfo {
        count
        lastPage
        hasMorePages
      }
      data {
        id
        title
        slug
        sid
        published_at
        html
      }
    }
  }
`

export function listFeedArticles(filter?: { desk: string; tag: string; author: string }) {
  return getAllWithPagination(ListArticles, filter, ({ articles: { paginatorInfo, data } }) => {
    const res = data.map((data: RawArticleLike) => normalizeArticle(data))
    return {
      paginatorInfo,
      data: res,
    }
  })
}
