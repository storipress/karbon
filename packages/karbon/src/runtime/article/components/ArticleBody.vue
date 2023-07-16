<script lang="ts" setup>
import { useAsyncState, useElementBounding, whenever } from '@vueuse/core'
import invariant from 'tiny-invariant'
import { AdvertisingSlot } from '@storipress/vue-advertising'
import { useArticle, useOptionalArticle } from '../utils'
import { decryptPaidContent, processingArticles } from '../utils/inject-paid-content'
import { useRenderEditorBlock } from '../utils/render-editor-block'
import { CUSTOM_FIELD_EDITOR_BLOCK_KEY } from '../../constants'
import type { AdSegment, NormalSegment, Segment } from '../../lib/split-article'
import type { ViewableApiResult } from '../../composables/viewable'
import { ArticlePlan } from '../../types'

// @ts-expect-error virtual file
import { editorBlocks } from '#build/editor-blocks.mjs'
import {
  computed,
  nextTick,
  onMounted,
  ref,
  useDecryptClient,
  useEmbed,
  useNuxtApp,
  watch,
  watchEffect,
} from '#imports'

const { $paywall } = useNuxtApp()
const { loadAll: fixArticleEmbed } = useEmbed()

const root = ref<HTMLElement>()
const article = useOptionalArticle()

const articleID = computed(() => article?.id)
const paywallID = computed(() => `paywall-${articleID.value || crypto.randomUUID()}`)
const articlePlan = computed(() => article?.plan || ArticlePlan.Free)

const getDecryptKey = useDecryptClient<ViewableApiResult>()
watchEffect(() => {
  if (!root.value) return
  processingArticles(root.value, fixArticleEmbed)
})

const { state: articleSegments, execute } = useAsyncState<Segment[]>(
  async () => {
    return await decryptPaidContent(article?.paidContent?.key ?? '', article?.segments ?? [], getDecryptKey)
  },
  article?.segments ?? [],
)

watch(
  articleSegments,
  () => {
    fixArticleEmbed()
  },
  {
    flush: 'post',
  },
)

const { left } = useElementBounding(root)
const { render } = useRenderEditorBlock(editorBlocks)
const customFieldsKey = CUSTOM_FIELD_EDITOR_BLOCK_KEY
// @ts-expect-error internal untyped property
const { [customFieldsKey]: customFields } = useArticle()

const profile = ref()
const showPaywall = computed(() => {
  return (
    (articlePlan.value === 'member' && !profile.value?.id) ||
    (articlePlan.value === 'subscriber' && !profile.value?.subscribed)
  )
})

async function hydrationBlocks() {
  const editorBlocksDom = document.querySelectorAll('div[data-format="embed"]')
  const editorBlocks = Array.from(editorBlocksDom).map((el) => ({
    uuid: el.getAttribute('data-uuid'),
    name: el.getAttribute('data-block-name'),
  }))
  for (const { uuid, name } of editorBlocks) {
    if (uuid && name) {
      try {
        await render(customFields[uuid], { uuid, name })
      } catch (error) {
        console.error(error)
      }
    }
  }
  await fixArticleEmbed()
}

// retry decrypt after login
whenever(
  () => !showPaywall.value,
  async () => {
    await execute()
    await nextTick()
    await hydrationBlocks()
  },
  { flush: 'post' },
)

onMounted(() => {
  hydrationBlocks()
})

watch(
  () => $paywall.paywall.value?.profile,
  (data) => {
    profile.value = data?.id ? data : null
  },
)
whenever(
  showPaywall,
  async () => {
    await nextTick(() => {
      const id = articleID.value
      invariant(id, 'No article id for paywall')
      if ($paywall?.mountArticlePaywall) {
        $paywall.mountArticlePaywall(paywallID.value, { id, plan: articlePlan.value })
      }
    })
  },
  { immediate: true },
)
</script>

<template>
  <div ref="root" class="article-body" :style="{ '--left-offset': `${left}px` }">
    <div v-for="(segment, index) of articleSegments" :key="`${segment.id}-${index}`">
      <AdvertisingSlot
        v-if="segment.type === 'ad'"
        :id="(segment as AdSegment).id"
        v-bind="(segment as AdSegment).props"
      />
      <div v-else-if="segment.id === 'normal'" v-html="(segment as NormalSegment).html" />
    </div>
    <div v-if="showPaywall" :id="paywallID" class="paywall-container" />
  </div>
</template>
