<script lang="ts" setup>
const tag = setupPage({ type: 'tag' })
const type = useField('custom-field-for', FieldType.Text)
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div>
      <div>Custom collection page</div>
      <div>Tag Page</div>
      <ul>
        <li>name: {{ tag.name }}</li>
      </ul>
    </div>
    <div>Custom field for: {{ type }}</div>
  </div>
</template>
