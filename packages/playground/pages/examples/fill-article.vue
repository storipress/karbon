<script lang="ts" setup>
const { articles: first2Articles } = useFillArticles(2)
const { articles: another2Articles } = useFillArticles(2)
</script>

<template>
  <div class="flex">
    <div v-for="article in first2Articles" :key="article.id" class="border border-black">
      <ArticleLayout :article="article" />
    </div>
    <div v-for="article in another2Articles" :key="article.id" class="border border-black">
      <ArticleLayout :article="article" />
    </div>
  </div>
</template>
