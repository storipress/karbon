<script lang="ts" setup>
import { Article } from '~~/sdk/runtime/composables/front-page'

const desk = setupDeskPage()
const booleanField = useField('desk_group1.boolean_field', FieldType.Bool, true)
const colorField = useField('desk_group1.color_field', FieldType.Color)
const numberField = useField('desk_group1.number_field', FieldType.Number)
const textField = useField('desk_group1.text_field', FieldType.Text)
const { preload, createLoadMore } = useArticleLoader({ preload: 4, chunk: 4 })
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div>
      <div>Desk data</div>
      <ol>
        <li>name: {{ desk.name }}</li>
        <li>slug: {{ desk.slug }}</li>
        <li>
          sub desks:
          <ul v-for="subDesk in desk.desks" :key="subDesk.id">
            <li>{{ subDesk }}</li>
          </ul>
        </li>
      </ol>
    </div>

    <div>
      <div>Custom field of boolean: {{ booleanField }}</div>
      <div>Custom field of color: {{ colorField }}</div>
      <div>Custom field of number: {{ numberField }}</div>
      <div>Custom field of text: {{ textField }}</div>
    </div>

    <div class="flex gap-2"><ArticleLayout v-for="article of preload" :key="article.id" :article="article" /></div>
    <div>Infinite scroll start</div>
    <InfiniteScroll v-slot="articles" :source="createLoadMore">
      <div class="flex gap-2 mb-2">
        <ArticleLayout v-for="article of (articles.items as Article[])" :key="article.id" :article="article" />
      </div>
    </InfiniteScroll>
  </div>
</template>
