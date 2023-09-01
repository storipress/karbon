import { compact, first, map, pathOr, pipe } from 'remeda'
import type { PartialDeep } from 'type-fest'
import type { MetaFlatInput } from '@zhead/schema'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { isDefined, toRef } from '@vueuse/core'
import { watchSyncEffect } from 'vue'
import { useHead, useNuxtApp, useSeoMeta } from '#imports'

interface SEOItem {
  title: string
  description: string
}

interface SEOConfig {
  meta: SEOItem
  og: SEOItem
  ogImage: string
}

export interface SEOInput extends SEOItem {
  plaintext: string
  headline: string
  cover: { url: string }
  seo: SEOConfig
}

export type RawSEOInput = PartialDeep<SEOInput> & Record<string, any>

function path(object: RawSEOInput, p: string[]): string | undefined {
  return pathOr(object as Record<string, any>, p as any, undefined)
}

function createFirstFound(paths: string[][]) {
  return (input: RawSEOInput): string | undefined => {
    return pipe(
      paths,
      map((p) => path(input, p)),
      compact,
      first(),
    )
  }
}

const TITLE = [['seo', 'meta', 'title'], ['title']]
const DESCRIPTION = [['seo', 'meta', 'description'], ['plaintext']]
const OG_TITLE = [['seo', 'og', 'title'], ...TITLE]
const OG_DESCRIPTION = [['seo', 'og', 'description'], ...DESCRIPTION]
const OG_IMAGE = [['seo', 'ogImage'], ['headline'], ['cover', 'url']]

function createSEO<T>(pick: (input: RawSEOInput) => T, map: (input: T) => MetaInput | undefined | false) {
  return (input: RawSEOInput) => {
    return map(pick(input))
  }
}

function simpleSEO(paths: string[][], map: (input: string | undefined) => MetaInput | undefined | false) {
  return createSEO(createFirstFound(paths), map)
}

type MetaInput = MetaFlatInput & { title?: string }

type SEOHandler<T = MetaInput> = (input: RawSEOInput) => T | undefined | false
type SEOPreset<T = MetaInput> = SEOHandler<T> | SEOHandler<T>[]

interface MetaDefineSEOInput {
  type?: 'meta'
  setup: (options: Record<string, any>) => SEOPreset
}

type DefineSEOInput = MetaDefineSEOInput

type NormalizedSEOHandler = (input: RawSEOInput) => void
type NormalizedSEOPreset = (options: Record<string, any>) => NormalizedSEOHandler

function useMeta(seo: MetaInput) {
  const { title, ...meta } = seo

  if (title) {
    useHead({ title }, { mode: 'server' })
  }

  useSeoMeta(meta)
}

interface MetaDefineSEOHandlerInput {
  type?: 'meta'
  handler: SEOHandler
}

type DefineSEOHandlerInput = MetaDefineSEOHandlerInput

export function defineSEOHandler(inputOrHandler: DefineSEOHandlerInput | SEOHandler): NormalizedSEOHandler {
  const { handler } = typeof inputOrHandler === 'function' ? { handler: inputOrHandler } : inputOrHandler

  return (input: RawSEOInput) => {
    const seo = handler(input)

    if (seo) {
      useMeta(seo)
    }
  }
}

export function defineSEOPreset(
  inputOrSetup: DefineSEOInput | ((options: Record<string, any>) => SEOPreset<MetaInput>),
): NormalizedSEOPreset {
  const { setup } = typeof inputOrSetup === 'function' ? { setup: inputOrSetup } : inputOrSetup

  return (options: Record<string, any>) => {
    const maybeHandlers = setup(options)
    const handlers = Array.isArray(maybeHandlers) ? maybeHandlers : [maybeHandlers]
    return (input: RawSEOInput) => {
      for (const handle of handlers) {
        const seo = handle(input)

        if (seo) {
          useMeta(seo)
        }
      }
    }
  }
}

export const basic = defineSEOPreset(({ twitterCard = 'summary_large_image' }) => [
  simpleSEO(TITLE, (title: string | undefined) => isDefined(title) && { title }),
  simpleSEO(DESCRIPTION, (description) => isDefined(description) && { description }),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { ogTitle }),
  simpleSEO(OG_DESCRIPTION, (ogDescription) => isDefined(ogDescription) && { ogDescription }),
  simpleSEO(OG_IMAGE, (ogImage) => isDefined(ogImage) && { ogImage }),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { twitterTitle: ogTitle }),
  simpleSEO(OG_DESCRIPTION, (ogDescription) => isDefined(ogDescription) && { twitterDescription: ogDescription }),
  simpleSEO(OG_IMAGE, (ogImage) => isDefined(ogImage) && { twitterImage: ogImage }),
  () => ({ twitterCard }),
])

const emptyPreset = defineSEOPreset(() => [])

const presets: Record<string, NormalizedSEOPreset> = {
  basic,
  __empty: emptyPreset,
}

export const builtinPresets = new Set(Object.keys(presets))

export interface PresetConfig {
  preset?: string
  presetFactory?: NormalizedSEOPreset
  options?: Record<string, any>
}

type InlineSEOPreset = [preset: NormalizedSEOPreset, options?: Record<string, any>]

type PresetConfigInput = PresetConfig | InlineSEOPreset | NormalizedSEOHandler

function loadSEOConfig(): PresetConfigInput[] {
  return useNuxtApp().$storipressInternal.seoConfig
}

export function resolveSEOPresets(configs: PresetConfigInput[]): NormalizedSEOHandler[] {
  return configs.map((config: PresetConfigInput) => {
    if (typeof config === 'function') {
      return config
    } else if (Array.isArray(config)) {
      const [presetFactory, options = {}] = config
      return presetFactory(options)
    }

    if (config.presetFactory) {
      return config.presetFactory(config.options || {})
    }

    return (presets[config.preset || '__empty'] || emptyPreset)(config.options || {})
  })
}

export function useSEO(maybeRefInput: MaybeRefOrGetter<RawSEOInput>, presets: PresetConfigInput[] = loadSEOConfig()) {
  const handlers = resolveSEOPresets(presets)
  const refInput = toRef(maybeRefInput)

  watchSyncEffect(() => {
    const input = refInput.value
    for (const handle of handlers) {
      handle(input)
    }
  })
}
