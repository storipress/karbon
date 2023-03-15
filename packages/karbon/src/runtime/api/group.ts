import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'

const ListGroups = gql`
  query ListGroups {
    customFieldGroups {
      data {
        id
        key
        type
        name
      }
    }
  }
`

const GetGroup = gql`
  query GetGroup($key: ID!) {
    customFieldGroup(key: $key) {
      id
      key
      name
      tags {
        id
        sid
        slug
      }
    }
  }
`

export async function listGroups() {
  const client = useStoripressClient()
  const { data } = await client.query({ query: ListGroups })

  return data.customFieldGroups
}

export async function getGroup(key: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetGroup, variables: { key } })

  return data.customFieldGroup
}
