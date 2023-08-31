import { compact, first, identity, map, pathOr, pipe } from 'remeda'
import type { PartialDeep } from 'type-fest'
import type { MetaFlatInput } from '@zhead/schema'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { isDefined, toRef } from '@vueuse/core'
import { watchSyncEffect } from 'vue'
import { useArticleFilter, useHead, useNuxtApp, useSeoMeta } from '#imports'

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

interface SEOContext {
  articleFilter: (html: string) => string
}

type MetaInput = MetaFlatInput & { title?: string }

type SEOHandler<T = MetaInput> = (input: RawSEOInput, ctx: SEOContext) => T | undefined | false
type SEOPreset<T = MetaInput> = SEOHandler<T> | SEOHandler<T>[]
type SEOMapResult = MetaInput | undefined | false
type SEOMapFn<T> = (input: T) => SEOMapResult
type SEOFilterFn<T> = (input: T, ctx: SEOContext) => T

function createSEO<T>(
  pick: (input: RawSEOInput) => T,
  map: SEOMapFn<T>,
  filter: SEOFilterFn<T> = identity,
): SEOHandler {
  return (input: RawSEOInput, ctx) => {
    return map(filter(pick(input), ctx))
  }
}

function simpleSEO(
  paths: string[][],
  map: SEOMapFn<string | undefined>,
  filter: SEOFilterFn<string | undefined> = identity,
): SEOHandler {
  return createSEO(createFirstFound(paths), map, filter)
}

function seoHtmlFilter(input: string | undefined, ctx: SEOContext) {
  if (!input) {
    return input
  }

  return ctx.articleFilter(input)
}

interface MetaDefineSEOInput {
  type?: 'meta'
  setup: (options: Record<string, any>) => SEOPreset
}

type DefineSEOInput = MetaDefineSEOInput

type NormalizedSEOHandler = (input: RawSEOInput, ctx: SEOContext) => void
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

  return (input: RawSEOInput, ctx: SEOContext) => {
    const seo = handler(input, ctx)

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
    return (input: RawSEOInput, ctx: SEOContext) => {
      for (const handle of handlers) {
        const seo = handle(input, ctx)

        if (seo) {
          useMeta(seo)
        }
      }
    }
  }
}

export const basic = defineSEOPreset(({ twitterCard = 'summary_large_image' }) => [
  simpleSEO(TITLE, (title: string | undefined) => isDefined(title) && { title }, seoHtmlFilter),
  simpleSEO(DESCRIPTION, (description) => isDefined(description) && { description }, seoHtmlFilter),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { ogTitle }, seoHtmlFilter),
  simpleSEO(OG_DESCRIPTION, (ogDescription) => isDefined(ogDescription) && { ogDescription }, seoHtmlFilter),
  simpleSEO(OG_IMAGE, (ogImage) => isDefined(ogImage) && { ogImage }),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { twitterTitle: ogTitle }, seoHtmlFilter),
  simpleSEO(
    OG_DESCRIPTION,
    (ogDescription) => isDefined(ogDescription) && { twitterDescription: ogDescription },
    seoHtmlFilter,
  ),
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
  const articleFilter = useArticleFilter()
  const ctx: SEOContext = {
    articleFilter,
  }

  watchSyncEffect(() => {
    const input = refInput.value
    for (const handle of handlers) {
      handle(input, ctx)
    }
  })
}
