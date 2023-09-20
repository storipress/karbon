import { compact, first, map, pathOr, pipe } from 'remeda'
import type { PartialDeep } from 'type-fest'
import type { MetaFlatInput } from '@zhead/schema'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { isDefined, toRef } from '@vueuse/core'
import { watchSyncEffect } from 'vue'
import truncate from 'lodash.truncate'
import { parseURL, resolveURL, withHttps, withoutTrailingSlash } from 'ufo'
import type { BaseMeta, Resources } from '../types'
import { invalidContext } from '../utils/invalid-context'
import { useArticleFilter, useHead, useNuxtApp, useSeoMeta, useSite } from '#imports'
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

const TITLE = [['seo', 'meta', 'title'], ['title'], ['name']]
const DESK_DESCRIPTION = [['deskSEO', 'meta', 'description']]
const DESCRIPTION = [['seo', 'meta', 'description'], ['plaintext'], ...DESK_DESCRIPTION]
const OG_TITLE = [['seo', 'og', 'title'], ...TITLE]
const OG_DESK_DESCRIPTION = [['deskSEO', 'og', 'description']]
const OG_DESCRIPTION = [['seo', 'og', 'description'], ...OG_DESK_DESCRIPTION, ...DESCRIPTION]
const OG_IMAGE = [['seo', 'ogImage'], ['headline'], ['cover', 'url'], ['avatar']]
const AUTHOR_BIO = [['bio']]
const TYPE_NAME = [['__typename']]

interface HandlerContext {
  metaType?: Resources
  site: ReturnType<typeof useSite>
  runtimeConfig: ReturnType<typeof useRuntimeConfig>
  articleFilter: ReturnType<typeof useArticleFilter>
}

function createSEO<T>(
  pick: (input: RawSEOInput, context: HandlerContext) => T,
  map: (input: T, context: HandlerContext) => MetaInput | undefined | false,
  metaType?: Resources[],
) {
  return (input: RawSEOInput, context: HandlerContext) => {
    if (metaType && context.metaType && !metaType.includes(context.metaType)) return undefined

    return map(pick(input, context), context)
  }
}

function simpleSEO(
  paths: string[][],
  map: (input: string | undefined, context: HandlerContext) => MetaInput | undefined | false,
  metaType?: Resources[],
) {
  return createSEO(createFirstFound(paths), map, metaType)
}

type MetaInput = MetaFlatInput & { title?: string }

type SEOHandler<T = MetaInput> = (input: RawSEOInput, context: HandlerContext) => T | undefined | false
type SEOPreset<T = MetaInput> = SEOHandler<T> | SEOHandler<T>[]

interface MetaDefineSEOInput {
  type?: 'meta'
  setup: (options: Record<string, any>) => SEOPreset
}

type DefineSEOInput = MetaDefineSEOInput

type NormalizedSEOHandler = (input: RawSEOInput, context: HandlerContext) => void
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
    const seo = handler(input, {} as HandlerContext)

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
    return (input: RawSEOInput, context: HandlerContext) => {
      for (const handle of handlers) {
        const seo = handle(input, context)

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
function getResourceURL(input: RawSEOInput, context: HandlerContext): string | undefined {
  // skipcq: JS-W1043
  const typeName: ResourceType = input.__typename || '_'
  const resourceType = context.metaType || typeMap[typeName]
  const resourceUrls = urls[resourceType]
  if (!resourceUrls?.enable) return undefined

  // skipcq: JS-W1043
  const siteUrl = (context.runtimeConfig?.public?.siteUrl as string) || '/'
  const url = resourceUrls.toURL(input as BaseMeta, resourceUrls._context ?? invalidContext)
  return withoutTrailingSlash(resolveURL(siteUrl, url))
}

function getTwitterSite(_input: RawSEOInput, context: HandlerContext) {
  const twitterLink = context.site.value?.socials?.Twitter
  if (!twitterLink) return undefined

  const { pathname } = parseURL(withHttps(twitterLink))
  const accountPath = pathname.split('/')[1]
  return accountPath ? `@${accountPath}` : undefined
}

export const basic = defineSEOPreset(({ twitterCard = 'summary_large_image' }) => [
  // Resource
  simpleSEO(TITLE, (title: string | undefined) => isDefined(title) && { title }),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { ogTitle, twitterTitle: ogTitle }),
  simpleSEO(DESCRIPTION, (description) => isDefined(description) && { description }),
  simpleSEO(
    OG_DESCRIPTION,
    (ogDescription) => isDefined(ogDescription) && { ogDescription, twitterDescription: ogDescription },
  ),
  simpleSEO(OG_IMAGE, (ogImage) => isDefined(ogImage) && { ogImage, twitterImage: ogImage }),

  // Author
  simpleSEO(AUTHOR_BIO, (authorBio, { articleFilter }) => {
    const bio = truncate(articleFilter(authorBio ?? ''), {
      length: 150,
      separator: /,? +/,
    })
    return isDefined(authorBio) && { description: bio, ogDescription: bio, twitterDescription: bio }
  }),

  // Common
  simpleSEO(TYPE_NAME, (typeName) => {
    const type = typeName as ResourceType
    if (type === 'Article') return { ogType: 'article' }
    return { ogType: 'website' }
  }),
  createSEO(getResourceURL, (ogUrl) => isDefined(ogUrl) && { ogUrl }),
  createSEO(getTwitterSite, (twitterSite) => isDefined(twitterSite) && { twitterSite }),
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
  const runtimeConfig = useRuntimeConfig()
  const handlers = resolveSEOPresets(presets)
  const refInput = toRef(maybeRefInput)
  const articleFilter = useArticleFilter()
  const site = useSite()
  const nuxt = useNuxtApp()

  watchSyncEffect(() => {
    const context: HandlerContext = {
      metaType,
      runtimeConfig,
      site,
      articleFilter,
    }
    const input = refInput.value
    for (const handle of handlers) {
      nuxt.runWithContext(() => handle(input, context))
    }
  })
}
