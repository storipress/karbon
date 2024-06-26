<script lang="ts" setup>
import { useAsyncState, whenever } from '@vueuse/core'
import { AdvertisingSlot } from '@storipress/vue-advertising'

import { useArticle, useOptionalArticle } from '../utils'
import { decryptPaidContent, processingArticles } from '../utils/inject-paid-content'
import { useRenderEditorBlock } from '../utils/render-editor-block'
import { CUSTOM_FIELD_EDITOR_BLOCK_KEY } from '../../constants'
import type { AdSegment, NormalSegment, Segment } from '../../lib/split-article'
import type { ViewableApiResult } from '../../composables/viewable'
import { ArticlePlan } from '../../types'
import { verboseInvariant } from '../../utils/verbose-invariant'
import Prism from './prism-languages'

import {
  computed,
  nextTick,
  onMounted,
  ref,
  useArticleBodyStyle,
  useDecryptClient,
  useEmbed,
  useNuxtApp,
  watch,
  watchEffect,
} from '#imports'

// @ts-expect-error virtual file
import { editorBlocks } from '#build/editor-blocks.mjs'

const { $paywall, isHydrating } = useNuxtApp()
const { loadAll: fixArticleEmbed } = useEmbed()

const root = ref<HTMLElement>()
const article = useOptionalArticle()

const articleID = computed(() => article?.id)
const paywallID = computed(() => `paywall-${articleID.value || crypto.randomUUID()}`)
const articlePlan = computed(() => article?.plan || ArticlePlan.Free)

const getDecryptKey = useDecryptClient<ViewableApiResult>()
if (!isHydrating) {
  watchEffect(() => {
    if (!root.value) return
    processingArticles(root.value, fixArticleEmbed)
  })
}

const { state: articleSegments, execute } = useAsyncState<Segment[]>(async () => {
  return await decryptPaidContent(
    article?.paidContent?.key ?? '',
    article?.paidContent?.iv ?? '',
    article?.segments ?? [],
    getDecryptKey,
  )
}, article?.segments ?? [])

const wrapArticleSegments = computed(() => {
  let findedFirst = false
  return articleSegments.value.map((item) => {
    if (findedFirst) {
      return item
    }

    if (item.type === 'p') {
      findedFirst = true
      return {
        ...item,
        paragraphNum: 1,
      }
    }

    return item
  })
})

watch(
  articleSegments,
  () => {
    fixArticleEmbed()
  },
  {
    flush: 'post',
  },
)

const style = useArticleBodyStyle(root)
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
  Prism.highlightAll()
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
      verboseInvariant(id, 'No article id for paywall')
      if ($paywall?.mountArticlePaywall) {
        $paywall.mountArticlePaywall(paywallID.value, { id, plan: articlePlan.value })
      }
    })
  },
  { immediate: true },
)
</script>

<template>
  <div ref="root" class="article-body" :style="style">
    <div
      v-for="(segment, index) of wrapArticleSegments"
      :key="`${segment.id}-${index}`"
      :data-paragraph="segment.paragraphNum"
    >
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
