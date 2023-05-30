<script lang="ts" setup>
import invariant from 'tiny-invariant'

const type = useField('custom-field-for', FieldType.Text)
const site = useSite()
const multipleValues = useField('multiple-value', { type: FieldType.Text, all: true })

const { articles: alphabetArticles } = useFillArticles(10, [{ key: 'slug', value: 'alphabet' }])
const { articles: lastArticles } = useFillArticles(9)

watch(alphabetArticles, (articles) => {
  const slugs = new Set(articles.map((article) => article.slug))
  invariant(slugs.size > 1, 'Articles should have unique slugs')
})
</script>

<template>
  <div>
    <div>Custom field for: {{ type }}</div>
    <div>Multiple value: {{ multipleValues }}</div>
    <div>{{ site }}</div>
    <div class="text-4xl">Front page</div>
    <div>
      <NuxtLink to="/examples/layout">To layout </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/examples/qoo-layout">To qooLayout </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/examples/ssr">To ssr </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/examples/advertising">To advertising </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/examples/advertising-ssr">To advertising SSR </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/examples/fill-article">To fill article</NuxtLink>
    </div>
    <div>
      <NuxtLink to="/desks">To desks</NuxtLink>
    </div>
    <div>
      <NuxtLink to="/indexes">To indexes</NuxtLink>
    </div>
    <div>
      <NuxtLink to="/collection/1">To collection</NuxtLink>
    </div>
    <div>
      <NuxtLink to="/examples/pagination">To pagination </NuxtLink>
    </div>
    <hr style="margin: 10px" />
    <div class="flex w-screen">
      <div v-for="article in alphabetArticles" :key="article.id" class="border border-black flex-1 overflow-hidden">
        <ArticleLayout :article="article" />
      </div>
    </div>
    <div class="flex w-screen mt-4">
      <div v-for="article in lastArticles" :key="article.id" class="border border-black flex-1 overflow-hidden">
        <ArticleLayout :article="article" />
      </div>
    </div>
  </div>
</template>
