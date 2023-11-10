import { destr } from 'destr'
import truncate from 'lodash.truncate'
import type { Segment } from '../lib/split-article'
import type { ArticleDesk, ArticlePlan, ArticleTag } from '../types'
import { useArticleFilter } from '#imports'

export interface RawUserLike {
  id: string
  slug: string
  first_name: string
  last_name: string
  full_name: string
  socials: Record<string, string>
}

export interface RawArticleLike {
  id: string
  title: string
  blurb: string
  bio: string
  seo: string
  cover: string
  html: string
  plaintext: string
  plan: ArticlePlan
  authors: RawUserLike[]
  tags: ArticleTag[]
  desk: ArticleDesk
  published_at: string | number
}

export interface PaidContent {
  content: string
  key: string
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

export function normalizeArticle({
  title,
  blurb,
  bio,
  seo,
  cover,
  plan,
  plaintext,
  html,
  id,
  authors,
  desk,
  tags,
  published_at,
  ...rest
}: RawArticleLike) {
  const articleFilter = useArticleFilter()
  const rootDesk = desk.desk ? { desk: { ...desk.desk, id: String(desk.desk.id) } } : {}

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
    html,
    plaintext: truncate(plaintext, {
      // description length
      length: 120,
      // don't cut on word
      separator: /,? +/,
    }),
    cover: destr(cover),
    authors: authors?.map(({ socials, id, ...rest }) => ({
      ...rest,
      id: String(id),
      socials: destr(socials),
      name: rest.full_name,
    })),
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

export interface NormalizeArticle extends ReturnType<typeof normalizeArticle> {
  paidContent?: PaidContent
  segments: Segment[]
}

export function unwrapParagraph(input: string): string {
  if (!input) {
    return ''
  }

  return input.replace(/^<p>/, '').replace(/<\/p>$/, '')
}
