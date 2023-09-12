import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'

const ListAuthors = gql`
  query ListAuthors {
    users(includeInvitations: false) {
      id
      slug
      email
      first_name
      last_name
      full_name
      avatar
      location
      bio
      website
      socials
      created_at
      updated_at
      desks {
        id
        name
        slug
        seo
        order
      }
    }
  }
`
const GetAuthor = gql`
  query GetAuthor($id: ID!) {
    user(id: $id) {
      id
      slug
      email
      first_name
      last_name
      full_name
      avatar
      location
      bio
      website
      socials
      created_at
      updated_at
      desks {
        id
        name
        slug
        seo
        order
      }
    }
  }
`

export async function listAuthors() {
  const client = useStoripressClient()
  const { data } = await client.query({ query: ListAuthors })

  return data.users.map((user: any) => normalizeAuthor(user))
}

export async function getAuthor(id: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetAuthor, variables: { id } })
  return normalizeAuthor(data.user)
}

function normalizeAuthor(author: any) {
  if (!author) {
    return author
  }

  return {
    ...author,
    socials: author.socials ? JSON.parse(author.socials) : {},
    name: author.full_name,
  }
}
