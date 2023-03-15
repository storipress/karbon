<script lang="ts" setup>
const article = setupArticlePage()
const booleanField = useField('article_group1.boolean_field', FieldType.Bool)
const colorField = useField('article_group1.color_field', FieldType.Color)
const numberField = useField('article_group1.number_field', FieldType.Number)
const textField = useField('article_group1.text_field', FieldType.Text)
const repeatingField = useField('article_group2.repeat_field', FieldType.Text, true)
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div>
      <div class="text-sky-900">Article data</div>
      <ul>
        <li>title: {{ article.title }}</li>
        <li>layout: {{ article.layout }}</li>
      </ul>
    </div>
    <div>Custom field of boolean: {{ booleanField }}</div>
    <div>Custom field of color: {{ colorField }}</div>
    <div>Custom field of number: {{ numberField }}</div>
    <div>Custom field of text: {{ textField }}</div>
    <div>Custom field of repeat: {{ repeatingField }}</div>

    <ArticleLayout :article="article" layout="test_layout" />
  </div>
</template>
