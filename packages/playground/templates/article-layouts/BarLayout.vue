<script setup>
import Counter from '~~/components/Counter.vue'

const article = useArticle()
const currentID = useField('current-id', FieldType.Text)
const site = useSite()
const foo = computed(() => site.foo)
</script>

<template>
  <div>
    This is bar layout
    <div>id: {{ article.id }}</div>
    <div>article id from custom field: {{ currentID }}</div>
    <div>
      Content:

      <div>{{ article.content }}</div>
    </div>
    <div>
      site:
      <div>{{ site }}</div>
    </div>
    <Counter />
  </div>
</template>
