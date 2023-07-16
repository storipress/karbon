<script setup>
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()
</script>

<template>
  <div>
    This is foo layout
    <div>
      <Test />
    </div>
    <div>{{ width }} x {{ height }}</div>
    <Counter />
  </div>
</template>
