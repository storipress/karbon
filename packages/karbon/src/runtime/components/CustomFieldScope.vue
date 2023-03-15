<script lang="ts" setup>
import { useProvideFields } from '@storipress/custom-field'

const props = defineProps<{
  resource?: Record<string, any>
}>()

useProvideFields(props.resource)
</script>

<template>
  <slot />
</template>
