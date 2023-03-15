<script setup>
const type = useField('custom-field-for', FieldType.Text)
</script>

<template>
  <div>
    <div>test custom field {{ type }}</div>
    <div>test ssr render</div>
  </div>
</template>
