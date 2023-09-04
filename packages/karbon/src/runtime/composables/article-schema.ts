import { parse } from 'node-html-parser'
import { withoutTrailingSlash } from 'ufo'
import type { UseArticleReturn as Article } from '../types'
import { defineArticle, defineOrganization, definePerson, useResourcePageMeta, useSchemaOrg, useSite } from '#imports'
import type { ResourcePageContext } from '#build/storipress-urls.mjs'
import urls from '#build/storipress-urls.mjs'

export function useArticleSchemaOrg() {
  const pageMeta = useResourcePageMeta()
  const site = useSite()

  if (pageMeta.value) {
    useSchemaOrg([
      defineOrganization({
        name: () => site.value?.name || '',
        logo: () => site.value?.logo?.url,
      }),
      getDefineArticle(pageMeta.value, site),
    ])
  }
}

type PageMeta = NonNullable<ReturnType<typeof useResourcePageMeta>['value']>
const invalidContext = { identity: 'invalid', prefix: '', resource: 'invalid' } as unknown as ResourcePageContext

function getDefineArticle(pageMeta: PageMeta, site: ReturnType<typeof useSite>) {
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl as string
  const article: Article = pageMeta.meta
  const authors = article.authors.map((author) => {
    const { first_name, last_name, full_name } = author

    return definePerson({
      familyName: last_name,
      givenName: first_name,
      name: full_name,
      sameAs: [withoutTrailingSlash(siteUrl) + urls.author.toURL(author, urls.author._context ?? invalidContext)],
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
    url: pageMeta.route,
    publisher: () =>
      defineOrganization({
        name: () => site.value?.name || '',
        logo: () => site.value?.logo?.url,
      }),
    headline: article.title,
    mainEntityOfPage: {
      '@type': 'Article',
      '@id': pageMeta.route,
    },
    articleBody: article.plaintext,
    author: authors,
    image,
    datePublished: article.published_at,
    dateModified: article.updated_at,
  })
}
