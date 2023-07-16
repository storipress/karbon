<script lang="ts" setup>
import { AdvertisingProvider, AdvertisingSlot } from '@storipress/vue-advertising'
import { gptConfig } from '../config'

const backgroundColor = ref('red')
function blueBackground() {
  backgroundColor.value = 'blue'
}

onBeforeMount(() => {
  useHead({
    script: [{ children: 'parent.postMessage("BlueBackground:banner-ad", "*")' }],
  })
})
</script>

<template>
  <div>
    <div><NuxtLink to="/examples/advertising/">To prev</NuxtLink></div>
    <AdvertisingProvider :config="gptConfig">
      <div :style="{ backgroundColor }">
        <h1>Hello World</h1>
        <AdvertisingSlot id="banner-ad" :custom-event-handlers="{ blueBackground }" />
      </div>
    </AdvertisingProvider>
  </div>
</template>
