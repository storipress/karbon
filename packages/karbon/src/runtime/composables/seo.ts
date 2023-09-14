import { compact, first, map, pathOr, pipe } from 'remeda'
import type { PartialDeep } from 'type-fest'
import type { MetaFlatInput } from '@zhead/schema'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { isDefined, toRef } from '@vueuse/core'
import { watchSyncEffect } from 'vue'
import truncate from 'lodash.truncate'
import { resolveURL, withoutTrailingSlash } from 'ufo'
import type { BaseMeta, Resources } from '../types'
import { invalidContext } from '../utils/invalid-context'
import { useHead, useNuxtApp, useSeoMeta } from '#imports'
import urls from '#build/storipress-urls.mjs'

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
const DESK_DESCRIPTION = [['deskSEO', 'meta', 'description']]
const OG_TITLE = [['seo', 'og', 'title'], ...TITLE]
const OG_DESCRIPTION = [['seo', 'og', 'description'], ...DESCRIPTION]
const OG_DESK_DESCRIPTION = [['deskSEO', 'og', 'description']]
const OG_IMAGE = [['seo', 'ogImage'], ['headline'], ['cover', 'url']]
const AUTHOR_BIO = [['bio']]
const TYPE_NAME = [['__typename']]

function createSEO<T>(
  pick: (input: RawSEOInput, metaType?: Resources) => T,
  map: (input: T) => MetaInput | undefined | false,
) {
  return (input: RawSEOInput, metaType?: Resources) => {
    return map(pick(input, metaType))
  }
}

function simpleSEO(paths: string[][], map: (input: string | undefined) => MetaInput | undefined | false) {
  return createSEO(createFirstFound(paths), map)
}

type MetaInput = MetaFlatInput & { title?: string }

type SEOHandler<T = MetaInput> = (input: RawSEOInput, metaType?: Resources) => T | undefined | false
type SEOPreset<T = MetaInput> = SEOHandler<T> | SEOHandler<T>[]

interface MetaDefineSEOInput {
  type?: 'meta'
  setup: (options: Record<string, any>) => SEOPreset
}

type DefineSEOInput = MetaDefineSEOInput

type NormalizedSEOHandler = (input: RawSEOInput, metaType?: Resources) => void
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
    return (input: RawSEOInput, metaType?: Resources) => {
      for (const handle of handlers) {
        const seo = handle(input, metaType)

        if (seo) {
          useMeta(seo)
        }
      }
    }
  }
}

type ResourceType = 'Article' | 'Desk' | 'Tag' | 'User'
const typeMap: Record<ResourceType, Resources> = {
  Article: 'article',
  Desk: 'desk',
  User: 'author',
  Tag: 'tag',
}
function getResourceURL(input: RawSEOInput, metaType?: Resources): string | undefined {
  // skipcq: JS-W1043
  const typeName: ResourceType = input.__typename || '_'
  const resourceType = metaType || typeMap[typeName]
  const resourceUrls = urls[resourceType]
  if (!resourceUrls?.enable) return undefined

  const runtimeConfig = useRuntimeConfig()
  // skipcq: JS-W1043
  const siteUrl = (runtimeConfig?.public?.siteUrl as string) || '/'
  const url = resourceUrls.toURL(input as BaseMeta, resourceUrls._context ?? invalidContext)
  return withoutTrailingSlash(resolveURL(siteUrl, url))
}

export const basic = defineSEOPreset(({ twitterCard = 'summary_large_image' }) => [
  simpleSEO(TITLE, (title: string | undefined) => isDefined(title) && { title }),
  simpleSEO(DESCRIPTION, (description) => isDefined(description) && { description }),
  simpleSEO(DESK_DESCRIPTION, (description) => isDefined(description) && { description }),
  simpleSEO(AUTHOR_BIO, (authorBio) => {
    const bio = truncate(authorBio, {
      length: 150,
      separator: /,? +/,
    })
    return isDefined(authorBio) && { description: bio, ogDescription: bio }
  }),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { ogTitle }),
  simpleSEO(OG_DESCRIPTION, (ogDescription) => isDefined(ogDescription) && { ogDescription }),
  simpleSEO(OG_DESK_DESCRIPTION, (ogDescription) => isDefined(ogDescription) && { ogDescription }),
  simpleSEO(OG_IMAGE, (ogImage) => isDefined(ogImage) && { ogImage }),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { twitterTitle: ogTitle }),
  simpleSEO(OG_DESCRIPTION, (ogDescription) => isDefined(ogDescription) && { twitterDescription: ogDescription }),
  simpleSEO(OG_IMAGE, (ogImage) => isDefined(ogImage) && { twitterImage: ogImage }),
  simpleSEO(TYPE_NAME, (typeName) => {
    const type = typeName as ResourceType
    if (type === 'Article') return { ogType: 'article' }
    return { ogType: 'website' }
  }),
  createSEO(getResourceURL, (ogUrl) => isDefined(ogUrl) && { ogUrl }),
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

export function useSEO(
  maybeRefInput: MaybeRefOrGetter<RawSEOInput>,
  presets: PresetConfigInput[] = loadSEOConfig(),
  metaType?: Resources,
) {
  const handlers = resolveSEOPresets(presets)
  const refInput = toRef(maybeRefInput)

  watchSyncEffect(() => {
    const input = refInput.value
    for (const handle of handlers) {
      handle(input, metaType)
    }
  })
}
