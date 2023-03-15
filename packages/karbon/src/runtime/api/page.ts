import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'

const ListPages = gql`
  query ListPages {
    pages {
      id
      title
      seo
    }
  }
`
const GetPage = gql`
  query GetPage($id: ID!) {
    page(id: $id) {
      id
      title
      seo
    }
  }
`

export async function listPages() {
  const client = useStoripressClient()
  const { data } = await client.query({ query: ListPages })

  return data.pages
}

export async function getPage(id: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetPage, variables: { id } })

  return data.tag
}
