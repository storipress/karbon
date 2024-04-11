import { filter, first, identity, isTruthy, map, pathOr, pipe } from 'remeda'
import type { PartialDeep } from 'type-fest'
import type { MetaFlatInput } from '@zhead/schema'
import { isDefined } from '@vueuse/core'
import truncate from 'lodash.truncate'
import { parseURL, resolveURL, withHttps, withoutTrailingSlash } from 'ufo'
import type { ArticleMeta, AuthorMeta, DeskMeta, ResourcePage, Resources, TagMeta } from '../types'
import { invalidContext } from '../utils/invalid-context'
import type { getSite, useArticleFilter, useHead, useRuntimeConfig, useSeoMeta } from '#imports'

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
      filter(isTruthy),
      filter<string | undefined>(Boolean),
      first(),
    )
  }
}

const TITLE = [['seo', 'meta', 'title'], ['title'], ['name']]
const DESK_DESCRIPTION = [['deskSEO', 'meta', 'description']]
const DESCRIPTION = [['seo', 'meta', 'description'], ['blurb'], ['plaintext'], ...DESK_DESCRIPTION]
const OG_TITLE = [['seo', 'og', 'title'], ...TITLE]
const OG_DESK_DESCRIPTION = [['deskSEO', 'og', 'description']]
const OG_DESCRIPTION = [['seo', 'og', 'description'], ...OG_DESK_DESCRIPTION, ...DESCRIPTION]
const OG_IMAGE = [['seo', 'ogImage'], ['headline'], ['cover', 'url'], ['avatar']]
const AUTHOR_BIO = [['bio']]
const TYPE_NAME = [['__typename']]

export interface SEOContext {
  metaType?: Resources
  site: Awaited<ReturnType<typeof getSite>>
  runtimeConfig: ReturnType<typeof useRuntimeConfig>
  articleFilter: ReturnType<typeof useArticleFilter>
  useHead: typeof useHead
  useSeoMeta: typeof useSeoMeta
  resourceUrls: {
    // @ts-expect-error unknown
    article: ResourcePage<ArticleMeta>
    desk: ResourcePage<DeskMeta>
    author: ResourcePage<AuthorMeta>
    tag: ResourcePage<TagMeta>
    [key: string]: ResourcePage<TagMeta>
  }
}

type MetaInput = MetaFlatInput & { title?: string }

type SEOHandler<T = MetaInput> = (input: RawSEOInput, context: SEOContext) => T | undefined | false
type SEOPreset<T = MetaInput> = SEOHandler<T> | SEOHandler<T>[]
type SEOMapResult = MetaInput | undefined | false
type SEOMapFn<T> = (input: T, context: SEOContext) => SEOMapResult
type SEOFilterFn<T> = (input: T, ctx: SEOContext) => T

function createSEO<T>(
  pick: (input: RawSEOInput, context: SEOContext) => T,
  map: SEOMapFn<T>,
  filter: SEOFilterFn<T> = identity,
): SEOHandler {
  return (input: RawSEOInput, context: SEOContext) => {
    return map(filter(pick(input, context), context), context)
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

type NormalizedSEOHandler = (input: RawSEOInput, context: SEOContext) => void
type NormalizedSEOPreset = (options: Record<string, any>) => NormalizedSEOHandler

function useMeta(seo: MetaInput, ctx: SEOContext) {
  const { title, ...meta } = seo

  if (title) {
    ctx.useHead({ title }, { mode: 'server' })
  }

  ctx.useSeoMeta(meta)
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
      useMeta(seo, ctx)
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
    return (input: RawSEOInput, context: SEOContext) => {
      for (const handle of handlers) {
        const seo = handle(input, context)

        if (seo) {
          useMeta(seo, context)
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
function getResourceURL(input: RawSEOInput, context: SEOContext): string | undefined {
  // skipcq: JS-W1043
  const typeName: ResourceType = input.__typename || '_'
  const resourceType = context.metaType || typeMap[typeName]
  const resourceUrls = context.resourceUrls[resourceType]
  if (!resourceUrls?.enable) return undefined

  // skipcq: JS-W1043
  const siteUrl = (context.runtimeConfig?.public?.siteUrl as string) || '/'
  const url = resourceUrls.toURL(input as any, resourceUrls._context ?? invalidContext)
  return withoutTrailingSlash(resolveURL(siteUrl, url))
}

function getTwitterSite(_input: RawSEOInput, context: SEOContext) {
  const twitterLink = context.site?.socials?.Twitter
  if (!twitterLink) return undefined

  const { pathname } = parseURL(withHttps(twitterLink))
  const accountPath = pathname.split('/')[1]
  return accountPath ? `@${accountPath}` : undefined
}

export const basic = defineSEOPreset(({ twitterCard = 'summary_large_image' }) => [
  // Author
  simpleSEO(AUTHOR_BIO, (authorBio) => {
    const bio = truncate(authorBio ?? '', {
      length: 150,
      separator: /,? +/,
    })
    return isDefined(authorBio) && { description: bio, ogDescription: bio, twitterDescription: bio }
  }),

  // Resource
  simpleSEO(TITLE, (title: string | undefined) => isDefined(title) && { title }, seoHtmlFilter),
  simpleSEO(OG_TITLE, (ogTitle) => isDefined(ogTitle) && { ogTitle, twitterTitle: ogTitle }, seoHtmlFilter),
  simpleSEO(DESCRIPTION, (description) => isDefined(description) && { description }, seoHtmlFilter),
  simpleSEO(
    OG_DESCRIPTION,
    (ogDescription) => isDefined(ogDescription) && { ogDescription, twitterDescription: ogDescription },
    seoHtmlFilter,
  ),
  simpleSEO(OG_IMAGE, (ogImage) => isDefined(ogImage) && { ogImage, twitterImage: ogImage }),

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

export type PresetConfigInput = PresetConfig | InlineSEOPreset | NormalizedSEOHandler

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
