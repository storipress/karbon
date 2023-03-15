<script lang="ts" setup>
import { computed, useOptionalArticle } from '#imports'

const props = defineProps({
  value: { type: String, default: null },
})

const article = useOptionalArticle()
const display = computed(() => props.value ?? article?.blurb)
</script>

<template>
  <p v-html="display" />
</template>
