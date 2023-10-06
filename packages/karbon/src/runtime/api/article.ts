import { Buffer } from 'node:buffer'
import { gql } from '@apollo/client/core/index.js'
import { encrypt } from 'micro-aes-gcm'

// This file contains global crypto polyfill
import { CompactEncrypt } from '@storipress/jose-browser'
import { useStoripressClient } from '../composables/storipress-client'
import type { TypesenseFilter } from '../composables/typesense-client'
import { PER_PAGE, getSearchQuery, useTypesenseClient } from '../composables/typesense-client'
import { splitPaidContent } from '../lib/split-paid-content'
import type { NormalSegment } from '../lib/split-article'
import { splitArticle } from '../lib/split-article'
import { getStoripressConfig } from '../composables/storipress-base-client'
import { verboseInvariant } from '../utils/verbose-invariant'
import type { PaidContent, RawArticleLike, _NormalizeArticle } from './normalize-article'
import { normalizeArticle } from './normalize-article'

export type { NormalizeArticle, PaidContent } from './normalize-article'

const GetArticle = gql`
  query GetArticle($id: ID!) {
    article(id: $id) {
      id
      blurb
      published_at
      updated_at
      desk {
        id
        name
        slug
        layout {
          id
          name
        }
        desk {
          id
          name
          slug
          layout {
            id
            name
          }
        }
      }
      slug
      title
      featured
      cover
      seo
      html
      plaintext
      layout {
        id
        name
      }
      tags {
        id
        slug
        name
      }
      authors {
        id
        bio
        slug
        socials
        avatar
        email
        location
        first_name
        last_name
        full_name
      }
      plan
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
          ... on CustomFieldReferenceValue {
            id
            referenceValue: value {
              ... on Article {
                __typename
                id
                articleId: id
                title
              }
              ... on Desk {
                __typename
                id
                deskId: id
                name
              }
              ... on Tag {
                __typename
                id
                tagId: id
                name
              }
              ... on User {
                __typename
                id
                userId: id
                full_name
              }
            }
          }
          ... on CustomFieldSelectValue {
            id
            selectValue: value
          }
        }
        group {
          id
          key
          type
        }
      }
      relevances {
        id
        title
      }
      content_blocks {
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
          ... on CustomFieldReferenceValue {
            id
            referenceValue: value {
              ... on Article {
                __typename
                id
                articleId: id
                title
              }
              ... on Desk {
                __typename
                id
                deskId: id
                name
              }
              ... on Tag {
                __typename
                id
                tagId: id
                name
              }
              ... on User {
                __typename
                id
                userId: id
                full_name
              }
            }
          }
          ... on CustomFieldSelectValue {
            id
            selectValue: value
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

export async function listArticles(filter?: TypesenseFilter) {
  const typesenseClient = useTypesenseClient()
  const documents = typesenseClient?.collections('articles').documents()

  const articles = []
  let hasMore = true
  let page = 1
  while (hasMore) {
    const searchResult = await documents?.search(getSearchQuery(page, filter), {})
    const currentPageArticles =
      searchResult?.hits?.map(({ document }) => normalizeArticle(document as RawArticleLike)) ?? []
    articles.push(...currentPageArticles)

    hasMore = searchResult.found > searchResult.page * PER_PAGE
    page = searchResult.page + 1
  }
  return articles
}

export async function getArticle(id: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetArticle, variables: { id } })
  if (!data || !data.article) {
    return null
  }

  const res = await encryptArticle(normalizeArticle(data.article))
  return res
}

async function encryptArticle({ plan, html, id, ...rest }: _NormalizeArticle) {
  let freeHTML = html
  let paidContent: PaidContent | undefined

  let segments = splitArticle(html)

  if (plan !== 'free') {
    const storipress = getStoripressConfig()
    verboseInvariant(storipress.encryptKey, 'No encrypt key')
    const previewParagraph = storipress.previewParagraph ?? 3
    const [preview, paid] = splitPaidContent(html, storipress.previewParagraph ?? 3)
    freeHTML = preview

    const cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const key = await crypto.subtle.exportKey('raw', cryptoKey)
    const content = await encrypt(new Uint8Array(key), paid)
    const compactEncrypter = new CompactEncrypt(
      Buffer.from(JSON.stringify({ id, plan, key: Buffer.from(key).toString('base64') })),
    ).setProtectedHeader({ enc: 'A256GCM', alg: 'dir' })
    const encryptedKey = await compactEncrypter.encrypt(Buffer.from(storipress.encryptKey, 'base64'))
    paidContent = {
      key: encryptedKey,
      content: Buffer.from(content).toString('base64'),
    }

    segments = await Promise.all(
      segments.map(async (segment, index, source) => {
        const html = (segment as NormalSegment).html
        const noEncrypt = html === undefined || (index < previewParagraph && source.length > previewParagraph)
        if (noEncrypt) return segment

        const content = await encrypt(new Uint8Array(key), html)
        return {
          id: 'paid',
          type: segment.type,
          paidContent: Buffer.from(content).toString('base64'),
        }
      }),
    )
  }

  return {
    ...rest,
    id,
    plan,
    html: freeHTML,
    paidContent,
    segments,
  }
}
