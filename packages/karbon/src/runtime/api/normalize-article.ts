import { destr } from 'destr'
import truncate from 'lodash.truncate'
import type { Segment } from '../lib/split-article'
import type { ArticlePlan } from '../types'

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
  ...rest
}: RawArticleLike) {
  const articleFilter = useArticleFilter()

  return {
    ...rest,
    id,
    plan,
    bio: articleFilter(bio),
    bioHtml: bio,
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
    authors: authors?.map(({ socials, ...rest }) => ({
      ...rest,
      socials: destr(socials),
      name: rest.full_name,
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
