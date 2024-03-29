import { destr } from 'destr'
import truncate from 'lodash.truncate'
import type { Segment } from '../lib/split-article'
import type { ArticleDesk, ArticlePlan, ArticleTag } from '../types'
import { useArticleFilter } from '#imports'

export interface TypesenseArticleLike {
  id: string
  slug: string
  featured: boolean
  order: number
  updated_at: number
  title: string
  blurb: string
  seo: string
  cover: string
  plan: ArticlePlan
  authors: {
    id: number
    slug: string
    full_name: string
    socials: string
    avatar: string
    bio: string
    location: string
  }[]
  tags: {
    id: number
    name: string
    slug: string
  }[]
  desk: {
    id: number
    name: string
    slug: string
    desk?: undefined
  }
  published_at: string | number
  pathnames: string[]
  html?: undefined
  plaintext?: undefined
}
export interface RawUserLike {
  id: string
  slug: string
  full_name: string
  socials: string
  avatar: string
  bio: string
  location: string
}

export interface RawArticleLike {
  id: string
  slug: string
  featured: boolean
  updated_at: string | number
  title: string
  blurb: string
  seo: string
  cover: string
  html: string
  plaintext: string
  plan: ArticlePlan
  authors: RawUserLike[]
  tags: ArticleTag[]
  desk: ArticleDesk
  published_at: string | number
  order?: undefined
  pathnames?: undefined
}

export interface PaidContent {
  content: string
  key: string
  iv: string
}

export interface RawSEOItem {
  title: string
  description: string
}

export interface RawSEO {
  meta?: RawSEOItem
  og?: RawSEOItem
  ogImage?: string
}

export function normalizeArticle(article: RawArticleLike | TypesenseArticleLike) {
  const { title, blurb, seo, cover, plan, id, authors, desk, tags, published_at, html, plaintext, ...rest } = article

  const articleFilter = useArticleFilter()
  const rootDesk = desk?.desk ? { desk: { ...desk.desk, id: String(desk.desk.id) } } : {}
  const bio = authors?.[0]?.bio ?? ''

  return {
    ...rest,
    id,
    plan,
    bio: articleFilter(bio),
    bioHTML: bio,
    // published_at could be unix timestamp
    published_at: typeof published_at === 'string' ? published_at : new Date(published_at * 1000).toISOString(),
    title: unwrapParagraph(title),
    blurb: unwrapParagraph(blurb),
    seo: destr<RawSEO>(seo),
    html: html ?? '',
    plaintext: truncate(plaintext, {
      // description length
      length: 120,
      // don't cut on word
      separator: /,? +/,
    }),
    cover: destr(cover),
    authors:
      authors?.map(({ socials, id, ...rest }) => ({
        ...rest,
        id: String(id),
        socials: destr(socials),
        name: rest.full_name,
      })) ?? [],
    desk: {
      ...desk,
      ...rootDesk,
      id: String(desk.id),
    },
    tags: tags?.map(({ id, ...rest }) => ({
      ...rest,
      id: String(id),
    })),
  }
}

export type _NormalizeArticle = ReturnType<typeof normalizeArticle>

export type NormalizeArticle = _NormalizeArticle & {
  paidContent?: PaidContent
  segments: Segment[]
}

export function unwrapParagraph(input: string): string {
  if (!input) {
    return ''
  }

  return input.replace(/^<p>/, '').replace(/<\/p>$/, '')
}
