<script lang="ts" setup>
const route = useRoute()

const { createLoadMore, preload } = useArticleLoader({
  chunk: false,
  preload: 4,
  condition: [
    {
      type: 'desk',
      key: 'slug',
      value: 'test',
    },
  ],
})

// eslint-disable-next-line no-console
const onDone = () => console.log(`all articles added`)
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div v-for="item of preload" :key="item.id">{{ item }}</div>
    <InfiniteScroll v-slot="article" :source="createLoadMore" @done="onDone">
      <ArticleLayout :article="article.items" />
    </InfiniteScroll>
  </div>
</template>
