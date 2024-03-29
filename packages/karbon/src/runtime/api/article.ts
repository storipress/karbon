import { Buffer } from 'node:buffer'
import util from 'node:util'
import type { ZodError } from 'zod'
import { gql } from '@apollo/client/core/index.js'
import { destr } from 'destr'
import { gcm } from '@noble/ciphers/webcrypto/aes'
import { randomBytes } from '@noble/ciphers/webcrypto/utils'

// This file contains global crypto polyfill
import { CompactEncrypt } from '@storipress/jose-browser'
import type { SearchResponse } from 'typesense/lib/Typesense/Documents'
import type { MultiSearchResponse } from 'typesense/lib/Typesense/MultiSearch'
import { useStoripressClient } from '../composables/storipress-client'
import type { TypesenseFilter } from '../composables/typesense-client'
import { PER_PAGE, getSearchQuery, useTypesenseClient } from '../composables/typesense-client'
import { splitPaidContent } from '../lib/split-paid-content'
import type { NormalSegment } from '../lib/split-article'
import { splitArticle } from '../lib/split-article'
import { _karbonClientHooks, getStoripressConfig } from '../composables/storipress-base-client'
import { verboseInvariant } from '../utils/verbose-invariant'
import type { PaidContent, RawArticleLike, TypesenseArticleLike, _NormalizeArticle } from './normalize-article'
import { ArticleSchema } from './schema/typesense-article'
import { QueryArticleSchema } from './schema/query-article'
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
      shadow_authors
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

const depthObject = (myObject: unknown) => util.inspect(myObject, { depth: null })

interface FailedDocumentObject {
  document: TypesenseArticleLike
  error: ZodError['errors']
  id: string
}
function getCurrentPageArticles(searchResult: SearchResponse<TypesenseArticleLike>) {
  const failedDocuments: FailedDocumentObject[] = []
  const currentPageArticles =
    searchResult?.hits?.map(({ document }) => {
      if (process.env.NODE_ENV === 'development') {
        const parse = ArticleSchema.safeParse(document)
        if (!parse.success) {
          failedDocuments.push({ id: document.id, error: parse.error.errors, document })
        }
      }
      const article = normalizeArticle(document as TypesenseArticleLike)
      return article
    }) ?? []
  if (failedDocuments.length > 0) {
    const ids = failedDocuments.map((item) => item.id).join(', ')
    console.error(
      '\x1B[33m%s\x1B[0m',
      `Karbon WARN: Invalid articles (count: ${failedDocuments.length}, id: [${ids}]):`,
      depthObject(failedDocuments),
    )
  }

  return currentPageArticles
}

export async function listArticles(filter?: TypesenseFilter) {
  const storipress = getStoripressConfig()
  const typesenseClient = useTypesenseClient()
  const documents = typesenseClient.collections('articles').documents()

  const groupId = crypto.randomUUID()
  const site = storipress.clientId
  const name = 'listArticles'
  const articles = []
  const groupStartTime = Date.now()
  const id = crypto.randomUUID()
  const query = getSearchQuery(1, filter)

  const ctx = { name, id, groupId, query, site, groupStartTime, isFirstRequest: true, requestTime: Date.now() }
  _karbonClientHooks.callHookParallel('karbon:searchRequest', ctx)

  // `destr` is workaround for fetch adapter not automatically parse response
  const rawSearchResult = await documents.search(query, {}).catch((error: Error) => {
    _karbonClientHooks.callHookParallel('karbon:searchResponse', {
      ...ctx,
      type: 'error',
      responseTime: Date.now(),
      hasMore: true,
      error,
    })
    throw error
  })
  const searchResult = destr<SearchResponse<TypesenseArticleLike>>(rawSearchResult)

  const currentPageArticles = getCurrentPageArticles(searchResult)
  articles.push(...currentPageArticles)

  const hasMore = searchResult.found > searchResult.page * PER_PAGE

  _karbonClientHooks.callHookParallel('karbon:searchResponse', {
    ...ctx,
    type: 'complete',
    hasMore,
    responseTime: Date.now(),
  })

  if (hasMore) {
    const totalPage = Math.ceil(searchResult.found / PER_PAGE)
    // `index + 2` is used to skip the first page.
    // Assuming `totalPage === 3` , it will query [2, 3] pages.
    const searches = Array.from({ length: totalPage - 1 }, (_, index) => getSearchQuery(index + 2, filter))

    const multiSearchCtx = {
      ...ctx,
      id: crypto.randomUUID(),
      hasMore: false,
      isFirstRequest: false,
      query: searches,
      requestTime: Date.now(),
    }
    _karbonClientHooks.callHookParallel('karbon:searchRequest', multiSearchCtx)

    const rawMultiSearchResult = await typesenseClient.multiSearch.perform({ searches }).catch((error: Error) => {
      _karbonClientHooks.callHookParallel('karbon:searchResponse', {
        ...multiSearchCtx,
        type: 'error',
        responseTime: Date.now(),
        error,
      })
      throw error
    })
    const multiSearchResult = destr<MultiSearchResponse<TypesenseArticleLike[]>>(rawMultiSearchResult)
    const otherArticles = multiSearchResult.results.flatMap((searchResult) => getCurrentPageArticles(searchResult))
    articles.push(...otherArticles)

    _karbonClientHooks.callHookParallel('karbon:searchResponse', {
      ...multiSearchCtx,
      type: 'complete',
      responseTime: Date.now(),
    })
  }

  return articles
}

export async function getArticle(id: string) {
  const client = useStoripressClient()
  const { data } = await client.query<{ article: RawArticleLike }>({ query: GetArticle, variables: { id } })
  if (!data || !data.article) {
    return null
  }

  if (process.env.NODE_ENV === 'development') {
    const parse = QueryArticleSchema.safeParse(data.article)
    if (!parse.success) {
      const failedDocument = {
        id: data.article.id,
        error: parse.error.errors,
        document: data.article,
      }
      console.error(
        '\x1B[33m%s\x1B[0m',
        `Karbon WARN: Invalid article (id: ${data.article.id}):`,
        depthObject(failedDocument),
      )
    }
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
    const encoder = new TextEncoder()

    const cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const key = await crypto.subtle.exportKey('raw', cryptoKey)
    const iv = randomBytes(12)
    const cipher = gcm(new Uint8Array(key), iv)
    const content = await cipher.encrypt(encoder.encode(paid))

    const compactEncrypter = new CompactEncrypt(
      Buffer.from(JSON.stringify({ id, plan, key: Buffer.from(key).toString('base64') })),
    ).setProtectedHeader({ enc: 'A256GCM', alg: 'dir' })
    const encryptedKey = await compactEncrypter.encrypt(Buffer.from(storipress.encryptKey, 'base64'))
    paidContent = {
      key: encryptedKey,
      content: Buffer.from(content).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
    }

    segments = await Promise.all(
      segments.map(async (segment, index, source) => {
        const html = (segment as NormalSegment).html
        const noEncrypt = html === undefined || (index < previewParagraph && source.length > previewParagraph)
        if (noEncrypt) return segment

        const content = await cipher.encrypt(encoder.encode(html))
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
