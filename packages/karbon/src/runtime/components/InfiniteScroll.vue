<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import type { Article } from '../composables/front-page'
import CustomFieldScope from './CustomFieldScope.vue'
import { ref, useLoadMore } from '#imports'

const props = withDefaults(defineProps<{ as?: string; source: () => AsyncGenerator<Article | Article[]> }>(), {
  as: 'div',
})

const emit = defineEmits<{
  (event: 'moreLoaded', article: Article | Article[]): void
  (event: 'done'): void
}>()

const el = ref<HTMLElement | null>(null)

const { loading, list, loadMore, onLoadMore, onLoadDone } = useLoadMore<Article | Article[]>(props.source)

onLoadMore((item) => emit('moreLoaded', item))
onLoadDone(() => emit('done'))

useIntersectionObserver(
  el,
  async ([{ isIntersecting }]) => {
    if (!isIntersecting) {
      return
    }
    await loadMore()
  },
  {
    rootMargin: '50px',
  },
)
</script>

<template>
  <ClientOnly>
    <component :is="as" ref="el" v-bind="$attrs">
      <template v-for="article in list" :key="Array.isArray(article) ? article[0].id : article.id">
        <slot v-bind="{ items: article }">
          <CustomFieldScope :resource="article">
            <ArticleLayout :article="article as Article" />
          </CustomFieldScope>
        </slot>
      </template>
      <slot v-if="loading" name="loading">Loading...</slot>
    </component>
    <span ref="el" />
  </ClientOnly>
</template>
