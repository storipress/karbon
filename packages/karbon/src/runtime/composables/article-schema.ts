import { parse } from 'node-html-parser'
import { resolveURL, withHttps, withoutTrailingSlash } from 'ufo'
import { Hookable } from 'hookable'
import type { UseArticleReturn as Article } from '../types'
import {
  defineArticle,
  defineOrganization,
  definePerson,
  useResourcePageMeta,
  useRuntimeConfig,
  useSchemaOrg,
  useSite,
} from '#imports'
import type { ResourcePageContext } from '#build/storipress-urls.mjs'
import urls from '#build/storipress-urls.mjs'

type ArticleSchema = ReturnType<typeof defineArticle>
export const schemaOrgHooks = new Hookable<{
  'karbon:article-schema': (schema: ArticleSchema) => void
}>()

export function useArticleSchemaOrg() {
  const pageMeta = useResourcePageMeta()
  const site = useSite()

  if (pageMeta.value) {
    const articleSchema = getDefineArticle(pageMeta.value, site)
    tryOnServer(async () => {
      await schemaOrgHooks.callHookParallel('karbon:article-schema', articleSchema)
      useSchemaOrg([
        defineOrganization({
          name: () => site.value?.name || '',
          logo: () => site.value?.logo?.url,
        }),
        articleSchema,
      ])
    })
  }
}

function tryOnServer(fn: () => Promise<void>) {
  if (process.server) {
    onServerPrefetch(fn)
  } else {
    fn()
  }
}

type PageMeta = NonNullable<ReturnType<typeof useResourcePageMeta>['value']>
const invalidContext = { identity: 'invalid', prefix: '', resource: 'invalid' } as unknown as ResourcePageContext

function getDefineArticle(pageMeta: PageMeta, site: ReturnType<typeof useSite>) {
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = withoutTrailingSlash(runtimeConfig.public.siteUrl as string)
  const article: Article = pageMeta.meta
  const authors = article.authors.map((author) => {
    const { first_name, last_name, full_name } = author
    const hasAuthorPage = urls.author.enable
    const url = hasAuthorPage
      ? resolveURL(siteUrl, urls.author.toURL(author, urls.author._context ?? invalidContext))
      : undefined
    const socials = Object.values((author.socials ?? {}) as Record<string, string>).map((url) => withHttps(url))

    return definePerson({
      familyName: last_name,
      givenName: first_name,
      name: full_name,
      url,
      sameAs: [url, ...socials].filter((x): x is string => Boolean(x)),
    })
  })
  const doc = parse(article.html || '')
  const imgElements = [...doc.querySelectorAll('img')]
  const imgSrcList = imgElements.map((el) => el.getAttribute('src')).filter(Boolean)
  const image = [
    ...new Set(
      [(article.cover as { url: string } | null)?.url, ...imgSrcList].filter(
        Boolean as unknown as (x: unknown) => x is string,
      ),
    ),
  ]

  return defineArticle({
    '@context': 'https://schema.org',
    '@type': 'Article',
    url: resolveURL(siteUrl, pageMeta.route),
    publisher: () =>
      defineOrganization({
        name: () => site.value?.name || '',
        logo: () => site.value?.logo?.url,
      }),
    headline: article.title,
    mainEntityOfPage: resolveURL(siteUrl, pageMeta.route),
    articleBody: article.plaintext,
    author: authors,
    image,
    datePublished: article.published_at,
    dateModified: article.updated_at || '',
  })
}
