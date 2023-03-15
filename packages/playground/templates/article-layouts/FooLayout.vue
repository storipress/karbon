<script setup>
const currentID = useField('current-id', FieldType.Text)
const globalValue = useField('only-global', FieldType.Text)
const article = useArticle()
</script>

<template>
  <div>
    This is foo layout
    <div>article id from custom field: {{ currentID }}</div>
    <div>global custom field: {{ globalValue }}</div>
    <div>
      Content:

      <div>{{ article.content }}</div>
    </div>
    <NuxtLink to="/posts/2">To second article</NuxtLink>
    <Counter />
  </div>
</template>
