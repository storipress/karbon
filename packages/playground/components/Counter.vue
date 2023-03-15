<script lang="ts" setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    Component that used to proof hydration is success
    <button @click="count += 1">Press time {{ count }}</button>
  </div>
</template>
