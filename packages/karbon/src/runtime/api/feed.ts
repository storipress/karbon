import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'
import type { TypesenseFilter } from '../composables/typesense-client'
import { listArticles } from './article'

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

export function listFeedArticles(filter: TypesenseFilter = {}) {
  return listArticles(filter)
}

export async function getDeskWithSlug(slug: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetDesk, variables: { slug } })

  return data.desk
}
