import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'

const ListTags = gql`
  query ListTags {
    tags {
      id
      name
      slug
      sid
    }
  }
`
const GetTag = gql`
  query GetTag($id: ID!) {
    tag(id: $id) {
      id
      name
      slug
      sid
      metafields {
        id
        key
        type
        values {
          __typename
          ... on CustomFieldTextValue {
            id
            value
          }
          ... on CustomFieldNumberValue {
            id
            numberValue: value
          }
          ... on CustomFieldColorValue {
            id
            value
          }
          ... on CustomFieldUrlValue {
            id
            value
          }
          ... on CustomFieldBooleanValue {
            id
            booleanValue: value
          }
          ... on CustomFieldRichTextValue {
            id
            jsonValue: value
          }
          ... on CustomFieldFileValue {
            id
            fileValue: value {
              key
              url
              size
              mime_type
            }
          }
          ... on CustomFieldDateValue {
            id
            dateValue: value
          }
          ... on CustomFieldJsonValue {
            id
            jsonValue: value
          }
        }
        group {
          id
          key
          type
        }
      }
    }
  }
`

export async function listTags() {
  const client = useStoripressClient()
  const { data } = await client.query({ query: ListTags })

  return data.tags
}

export async function getTag(id: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetTag, variables: { id } })

  return data.tag
}
