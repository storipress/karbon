import type { MaybeRefOrGetter } from '@vueuse/core'
import { toRef } from '@vueuse/core'
import { watchSyncEffect } from 'vue'
import type { Resources } from '../types'
import type { PresetConfigInput, SEOContext } from './seo-preset'
import { getSite, useArticleFilter, useHead, useNuxtApp, useRuntimeConfig, useSeoMeta } from '#imports'
import urls from '#build/storipress-urls.mjs'

function loadSEOConfig(): PresetConfigInput[] {
  return useNuxtApp().$storipressInternal.seoConfig
}

export function useSEO(
  maybeRefInput: MaybeRefOrGetter<RawSEOInput>,
  presets: PresetConfigInput[] = loadSEOConfig(),
  metaType?: Resources,
) {
  const runtimeConfig = useRuntimeConfig()
  const handlers = resolveSEOPresets(presets)
  const refInput = toRef(maybeRefInput)
  const articleFilter = useArticleFilter()
  const nuxt = useNuxtApp()

  watchSyncEffect(async () => {
    const site = await getSite()
    const context: SEOContext = {
      metaType,
      runtimeConfig,
      site,
      articleFilter,
      useHead,
      useSeoMeta,
      resourceUrls: urls,
    }
    const input = refInput.value
    for (const handle of handlers) {
      nuxt.runWithContext(() => handle(input, context))
    }
  })
}
