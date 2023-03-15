<script lang="ts" setup>
const tag = setupTagPage()
const booleanField = useField('tag_group1.boolean_field', FieldType.Bool)
const colorField = useField('tag_group1.color_field', FieldType.Color)
const numberField = useField('tag_group1.number_field', FieldType.Number)
const textField = useField('tag_group1.text_field', FieldType.Text)
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div>
      <div>Tag Page</div>
      <ul>
        <li>name: {{ tag.name }}</li>
      </ul>
    </div>
    <div>
      <div>Custom field of boolean: {{ booleanField }}</div>
      <div>Custom field of color: {{ colorField }}</div>
      <div>Custom field of number: {{ numberField }}</div>
      <div>Custom field of text: {{ textField }}</div>
    </div>
  </div>
</template>
