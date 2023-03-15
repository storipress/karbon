<script lang="ts" setup>
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
</script>

<template>
  <component :is="tpl" v-if="article" />
</template>
