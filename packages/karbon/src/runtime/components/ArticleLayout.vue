<script lang="ts" setup>
import { parse } from 'node-html-parser'
import { getDefaultLayout } from '../utils/default-layout'
import type { UseArticleReturn as Article } from '../types'
import { useProvideArticle } from '../article/utils'
// @ts-expect-error virtual file
import { templates } from '#build/article-layouts.mjs'
import { computed } from '#imports'

const props = defineProps<{
  article: Article
  layout?: string
  resolveLayout?: (article: Article) => string
}>()

const tpl = computed(() => templates[resolveLayout()] || templates[getDefaultLayout()])

function resolveLayout(): string {
  if (!props.article) {
    return ''
  }
  const customLayout: string = props.article?.metafields?.find(
    ({ key, group }) => group.key === '__layoutmeta' && key === 'layoutid'
  )?.values?.[0]?.value
  return props.resolveLayout?.(props.article) || props.layout || customLayout || getDefaultLayout()
}

useProvideArticle(props.article)

const pageMeta = useResourcePageMeta()
if (pageMeta.value) {
  useSchemaOrg([getDefineArticle(pageMeta.value)])
}
type PageMeta = NonNullable<(typeof pageMeta)['value']>

const site = useSite()
function getDefineArticle(pageMeta: PageMeta) {
  const article: Article = pageMeta.meta
  const authors = article.authors.map((author) => {
    const { first_name, last_name, full_name, id } = author
    return {
      '@type': 'Person',
      familyName: last_name,
      givenName: first_name,
      name: full_name,
      mainEntityOfPage: `author/${id}`,
    }
  })
  const doc = parse(article.html)
  const imgElements = [...doc.querySelectorAll('img')]
  const imgSrcList = imgElements.map((el) => el.getAttribute('src')).filter(Boolean)
  const image = [...new Set([article.cover.url, ...imgSrcList])]

  return defineArticle({
    '@context': 'https://schema.org',
    '@type': 'Article',
    url: pageMeta.route,
    publisher: {
      '@type': 'Organization',
      name: site.value.name || '',
      logo: site.value.logo,
    },
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
</script>

<template>
  <component :is="tpl" v-if="article" />
</template>
