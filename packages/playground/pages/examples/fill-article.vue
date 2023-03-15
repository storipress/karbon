<script lang="ts" setup>
const { articles: alphabetArticles } = useFillArticles(2, [{ key: 'slug', value: 'alphabet' }])
</script>

<template>
  <div class="flex">
    <div v-for="article in alphabetArticles" :key="article.id" class="border border-black">
      <ArticleLayout :article="article" />
    </div>
  </div>
</template>
