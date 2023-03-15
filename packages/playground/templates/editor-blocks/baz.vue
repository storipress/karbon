<script lang="ts" setup>
import Counter from '~~/components/Counter.vue'

const boolValue = useField('baz.bool123', FieldType.Bool)
const numValue = useField('baz.num', FieldType.Number)
</script>

<template>
  <div>
    <div>
      <div>Try edit custom value and see the value change here</div>
      <div>bool: {{ boolValue }}</div>
      <div>num: {{ numValue }}</div>
    </div>
    <Counter />
  </div>
</template>
