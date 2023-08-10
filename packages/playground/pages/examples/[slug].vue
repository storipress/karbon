<script lang="ts" setup>
import type { Article } from 'sdk/runtime/composables/front-page'

const route = useRoute()
async function* GenSource() {
  const allArticles = await getAllArticles()
  const currentArticleIndex = allArticles.data.value.findIndex(({ id }) => id === (route.params.slug as string))
  const articles = allArticles.data.value.slice(currentArticleIndex < 0 ? 0 : currentArticleIndex)

  for (const article of articles) {
    yield article
  }
}

// eslint-disable-next-line no-console
const onMoreLoaded = (article: Article) => console.log(`article ${article.id} is added.`, article)

// eslint-disable-next-line no-console
const onDone = () => console.log(`all articles added`)
const queryBy = 'title'
const searchInput = ref('')
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <StoripressSearch v-slot="props" v-model="searchInput" lazy :query-by="queryBy">
      <div>
        <label>Just typing...</label>
        <input v-model="searchInput" placeholder="search" />
      </div>
      <div v-if="props.items.length === 0">
        <h1 class="no-result">We’re sorry, we couldn’t find any articles!</h1>
        <h2 class="try-another-keyword">Why don't you try searching for something else?</h2>
      </div>
      <div v-else class="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-3">
        <div v-for="item in props.items" :key="item.id">
          {{ item.title }}
        </div>
      </div>
    </StoripressSearch>
    <InfiniteScroll :source="GenSource" @more-loaded="onMoreLoaded" @done="onDone" />
  </div>
</template>
