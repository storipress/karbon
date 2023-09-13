import { destr } from 'destr'
import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'

const ListDesks = gql`
  query ListDesks {
    desks {
      id
      name
      slug
      seo
      order
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
const GetDesk = gql`
  query GetDesk($id: ID!) {
    desk(id: $id) {
      id
      name
      slug
      seo
      desks {
        id
        name
        slug
        seo
      }
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

export async function listDesks() {
  const client = useStoripressClient()
  const { data } = await client.query({ query: ListDesks })

  return data.desks.map((desk: Record<string, string>) => ({ ...desk, deskSEO: resolveSEO(desk.seo, desk.name) }))
}

export async function getDesk(id: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetDesk, variables: { id } })
  const desk = data.desk

  return { ...desk, deskSEO: resolveSEO(desk.seo, desk.name) }
}

export interface SEOItem {
  matched: boolean
  title: string
  description: null | string
}
function resolveSEO(seoString: string, deskName: string) {
  const defaultSeo = {
    meta: {
      matched: true,
      title: deskName,
      description: null,
    } as SEOItem,
    og: {
      matched: false,
      title: deskName,
      description: null,
    } as SEOItem,
  }

  const seo = destr<typeof defaultSeo>(seoString) ?? defaultSeo
  const meta = seo.meta
  const og = seo.og.matched ? seo.meta : seo.og

  meta.description ??= `Articles for ${deskName}`
  og.description ??= meta.description

  return { meta, og }
}
