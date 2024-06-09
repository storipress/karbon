<script lang="ts" setup>
const { createLoadMore, preload } = useArticleLoader({
  chunk: 4,
  preload: 4,
})

const onDone = () => console.log(`all articles added`)
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div v-for="item of preload" :key="item.id">{{ item }}</div>
    <InfiniteScroll v-slot="{ items }" :source="createLoadMore" @done="onDone">
      <ArticleLayout v-for="article in items" :key="article.id" :article="article" />
    </InfiniteScroll>
  </div>
</template>
