<script lang="ts" setup>
const { articles, previousPage, nextPage } = useArticlePagination({ limit: 5, condition: [] })
</script>

<template>
  <div>
    <div class="flex gap-2">
      <button class="p-2 rounded bg-teal-400" @click="previousPage">prev</button>
      <button class="p-2 rounded bg-teal-400" @click="nextPage">next</button>
    </div>
    <div class="grid grid-cols-2">
      <ArticleCard v-for="article of articles" :key="article.id" :article="article" />
    </div>
  </div>
</template>
