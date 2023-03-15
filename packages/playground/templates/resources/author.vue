<script lang="ts" setup>
const author = setupAuthorPage()
const type = useField('custom-field-for', FieldType.Text)
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div>
      <div>Author Page</div>
      <ul>
        <li>full name: {{ author.full_name }}</li>
        <li>email: {{ author.email }}</li>
        <li>avatar: {{ author.avatar }}</li>
        <li>location: {{ author.location }}</li>
        <li>bio: {{ author.bio }}</li>
      </ul>
    </div>
    <div>Custom field for: {{ type }}</div>
  </div>
</template>
