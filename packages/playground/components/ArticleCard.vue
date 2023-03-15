<script setup lang="ts">
import type { UseArticleReturn } from '@storipress/karbon'

defineProps<{ article: UseArticleReturn }>()
</script>

<template>
  <NuxtLink :to="article.url" class="mr-0 mb-[5%] flex-[0_0_100%] md:m-[0_3%_3%_0] md:flex-[0_0_48.5%] md:even:mr-0">
    <div
      class="rounded border border-[#eee] bg-[#fafbfb] duration-200 ease-out hover:bg-[#f1f1f1] hover:shadow-[0_0_36px_rgba(0,0,0,0.06)]"
    >
      <img v-if="article.cover?.url" :src="article.cover.url" class="aspect-[55/31] w-full rounded-t object-cover" />
      <div v-else class="aspect-[55/31] bg-gray-100" />
      <slot>
        <div class="relative px-[0.9rem] pt-[2.7rem] pb-[2.2rem] text-[#333]">
          <h2 class="text-center leading-[1.2]">{{ article.title }}</h2>
          <p class="mt-[0.45rem] mb-3 text-center text-xs uppercase leading-[2] opacity-70">{{ article.desk?.name }}</p>
        </div>
      </slot>
    </div>
  </NuxtLink>
</template>

<style scoped></style>
