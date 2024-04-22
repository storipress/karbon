import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'
import type { _NormalizeArticle } from './normalize-article'

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

export async function listFeedArticles(): Promise<_NormalizeArticle[]> {
  const allArticles = (await $fetch('/_storipress/posts/__all.json')) ?? []
  return allArticles
}

export async function getDeskWithSlug(slug: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetDesk, variables: { slug } })

  return data.desk
}
