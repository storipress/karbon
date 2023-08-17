<script lang="ts" setup>
const { $paywall } = useNuxtApp()

onMounted(async () => {
  await $paywall.mount()
  $paywall.checkQuery()
})

useFeedLink()

useAdvertisingHandler((segments) => {
  return segments
    .map((segment) => {
      if (segment.type !== 'embed') return segment
      return [
        segment,
        {
          type: 'ad' as const,
          id: 'banner-ad',
          props: {}, // 讓使用者可以傳入其它的 props
        },
      ]
    })
    .flat()
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
  <div id="paywall"></div>
</template>
