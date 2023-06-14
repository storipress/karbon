import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'
import { getAllWithPagination } from './helper'
import type { RawArticleLike } from './normalize-article'
import { normalizeArticle } from './normalize-article'

const ListArticles = gql`
  query ListArticles($page: Int!, $desk: ID, $desk_ids: [ID!]) {
    articles(page: $page, desk: $desk, desk_ids: $desk_ids, sortBy: [{ column: UPDATED_AT, order: DESC }]) {
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
        plaintext
      }
    }
  }
`

const GetDesk = gql`
  query GetDesk($slug: String) {
    desk(slug: $slug) {
      id
      sid
      name
      slug
      seo
      order
      open_access
      desks {
        id
        name
        slug
        seo
      }
    }
  }
`

export function listFeedArticles(filter?: { desk: string; tag: string; author: string; desk_ids: string }) {
  return getAllWithPagination(ListArticles, filter, ({ articles: { paginatorInfo, data } }) => {
    const res = data.map((data: RawArticleLike) => normalizeArticle(data))
    return {
      paginatorInfo,
      data: res,
    }
  })
}

export async function getDeskWithSlug(slug: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetDesk, variables: { slug } })

  return data.desk
}
