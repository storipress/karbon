import { parse } from 'node-html-parser'
import type { UseArticleReturn as Article } from '../types'
import { defineArticle, defineOrganization, definePerson, useResourcePageMeta, useSchemaOrg, useSite } from '#imports'

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

function getDefineArticle(pageMeta: PageMeta, site: ReturnType<typeof useSite>) {
  const article: Article = pageMeta.meta
  const authors = article.authors.map((author) => {
    const { first_name, last_name, full_name } = author

    return definePerson({
      familyName: last_name,
      givenName: first_name,
      name: full_name,
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
    authors,
    image,
    datePublished: article.published_at,
  })
}