import { gql } from '@apollo/client/core/index.js'
import { encrypt } from 'micro-aes-gcm'
import invariant from 'tiny-invariant'
// This file contains global crypto polyfill
import { CompactEncrypt } from '@storipress/jose-browser'
import { useStoripressClient } from '../composables/storipress-client'
import { splitPaidContent } from '../lib/split-paid-content'
import type { NormalSegment } from '../lib/split-article'
import { splitArticle } from '../lib/split-article'
import { getStoripressConfig } from '../composables/storipress-base-client'
import { getAllWithPagination } from './helper'
import type { PaidContent, RawArticleLike } from './normalize-article'
import { normalizeArticle } from './normalize-article'

export type { NormalizeArticle, PaidContent } from './normalize-article'

export const ListArticles = gql`
  query ListArticles($page: Int!) {
    articles(page: $page, sortBy: [{ column: PUBLISHED_AT, order: DESC }], published: true) {
      paginatorInfo {
        lastPage
        hasMorePages
        count
      }
      data {
        id
        title
        slug
        sid
        published_at
        plan
        cover
        seo
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
        authors {
          id
          slug
          bio
          socials
          avatar
          email
          location
          first_name
          last_name
          full_name
        }
      }
    }
  }
`
const GetArticle = gql`
  query GetArticle($id: ID!) {
    article(id: $id) {
      id
      blurb
      published_at
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

export async function listArticles(filter?: { desk: string; tag: string; author: string }) {
  return getAllWithPagination(ListArticles, filter, ({ articles: { paginatorInfo, data } }) => {
    const res = data.map((data: RawArticleLike) => normalizeArticle(data))
    return {
      paginatorInfo,
      data: res,
    }
  })
}

export async function getArticle(id: string) {
  const client = useStoripressClient()
  const { data } = await client.query({ query: GetArticle, variables: { id } })
  if (!data) {
    return null
  }

  const res = await encryptArticle(normalizeArticle(data.article))
  return res
}

async function encryptArticle({ plan, html, id, ...rest }: RawArticleLike) {
  let freeHTML = html
  let paidContent: PaidContent | undefined

  let segments = splitArticle(html)

  if (plan !== 'free') {
    const storipress = getStoripressConfig()
    invariant(storipress.encryptKey, 'No encrypt key')
    const previewParagraph = storipress.previewParagraph ?? 3
    const [preview, paid] = splitPaidContent(html, storipress.previewParagraph ?? 3)
    freeHTML = preview

    const cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const key = await crypto.subtle.exportKey('raw', cryptoKey)
    const content = await encrypt(new Uint8Array(key), paid)
    const compactEncrypter = new CompactEncrypt(
      Buffer.from(JSON.stringify({ id, plan, key: Buffer.from(key).toString('base64') }))
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
      })
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
