<script lang="ts" setup>
const tag = setupTagPage()
const type = useField('custom-field-for', FieldType.Text)
const tagGroup = useTagGroup('taggroup')
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div>
      <div>useTagGroup: {{ tagGroup }}</div>
    </div>
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
