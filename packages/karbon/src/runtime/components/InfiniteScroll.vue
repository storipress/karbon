<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import type { Article } from '../composables/front-page'
import CustomFieldScope from './CustomFieldScope.vue'
import { computed, useLoadMore } from '#imports'

const props = withDefaults(
  defineProps<{
    as?: string
    source: () => AsyncGenerator<Article | Article[]>
    distance?: number
    el?: HTMLElement | null
    preload?: boolean
  }>(),
  {
    as: 'div',
    distance: 50,
    el: null,
  },
)

const emit = defineEmits<{
  (event: 'moreLoaded', article: Article | Article[]): void
  (event: 'done'): void
}>()

const el = computed(() => {
  const root = props.el ?? document
  return root
})

const { loading, list, isDone, loadMore, onLoadMore, onLoadDone } = useLoadMore<Article | Article[]>(props.source, {
  preload: props.preload,
})

onLoadMore((item) => emit('moreLoaded', item))
onLoadDone(() => emit('done'))

if (process.client) {
  useInfiniteScroll(
    el,
    async () => {
      if (isDone.value) return
      await loadMore()
    },
    { distance: props.distance },
  )
}
</script>

<template>
  <ClientOnly>
    <component :is="as" v-bind="$attrs">
      <template v-for="article in list" :key="Array.isArray(article) ? article[0].id : article.id">
        <slot v-bind="{ items: article }">
          <CustomFieldScope :resource="article">
            <ArticleLayout :article="article as Article" />
          </CustomFieldScope>
        </slot>
      </template>
      <slot v-if="loading" name="loading">Loading...</slot>
    </component>
  </ClientOnly>
</template>
