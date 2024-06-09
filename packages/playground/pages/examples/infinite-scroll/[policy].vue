<script lang="ts" setup>
const route = useRoute()
const { policy } = route.params

if (policy !== 'stop' && policy !== 'show-unmatched') {
  navigateTo('/examples/infinite-scroll/stop')
}
const { createLoadMore, preload } = useArticleLoader({
  chunk: false,
  preload: 4,
  condition: [
    {
      type: 'desk',
      key: 'slug',
      value: 'test',
    },
  ],
  exhaustedPolicy: policy as 'stop' | 'show-unmatched',
})

const anotherPolicy = policy === 'stop' ? 'show-unmatched' : 'stop'

watch(
  () => route,
  () =>
    // we can't change policy on the fly, force reload
    location.reload(),
  { deep: true },
)

const onDone = () => console.log(`all articles added`)
</script>

<template>
  <div>
    <div><NuxtLink to="/">To home</NuxtLink></div>
    <div>
      <NuxtLink :to="`/examples/infinite-scroll/${anotherPolicy}`">To {{ anotherPolicy }} policy</NuxtLink>
    </div>
    <div v-for="item of preload" :key="item.id">{{ item }}</div>
    <InfiniteScroll :source="createLoadMore" @done="onDone" />
  </div>
</template>
