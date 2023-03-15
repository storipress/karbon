<script lang="ts" setup>
import type { ImageModifiers } from '@nuxt/image-edge'
import StoripressImage from '../../components/StoripressImage.vue'
import { computed, useOptionalArticle } from '#imports'

const props = defineProps<{
  src: string
  alt?: string
  width: string | number
  height: string | number
  quality?: number | string
  sizes?: string
  modifiers?: ImageModifiers
}>()

const article = useOptionalArticle()
const imageSrc = computed(() => props.src || article?.cover.url)
</script>

<template>
  <StoripressImage :src="imageSrc" :width="width" :height="height" :sizes="sizes" :modifiers="modifiers" :alt="alt" />
</template>
