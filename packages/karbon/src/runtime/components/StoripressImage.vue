<script lang="ts" setup>
// ref: https://v1.image.nuxtjs.org/components/nuxt-img
// ref: https://github.com/nuxt/image/blob/v1/src/runtime/providers/sanity.ts
import type { ImageModifiers } from '@nuxt/image-edge'
import { computed } from '#imports'

const props = defineProps<{
  src: string
  alt?: string
  width: string | number
  height: string | number
  quality?: number | string
  sizes?: string
  modifiers?: ImageModifiers
}>()

const providerMapping: Record<string, string> = {
  'assets.stori.press': 'Storipress',
  'images.unsplash.com': 'unsplash',
}

const provider = computed(() => {
  try {
    const url = new URL(props.src)
    return {
      name: providerMapping[url.hostname],
    }
  } catch {
    return { name: 'Storipress' }
  }
})
</script>

<template>
  <NuxtImg
    v-if="src"
    format="webp"
    :provider="provider.name"
    :src="src || ''"
    :width="width"
    :height="height"
    :quality="quality"
    :sizes="sizes"
    :alt="alt"
    :modifiers="modifiers"
  />
</template>
