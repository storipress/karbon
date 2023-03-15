import type { Promisable } from 'type-fest'
import type { Article } from './front-page'

interface ArticleMeta {
  id: string
  plan: 'member' | 'subscriber'
  key: string
}

export interface ViewableContext {
  auth: Record<string, any>
  meta: ArticleMeta
  getArticle: () => Promise<Article>
}

export interface DetailedViewableResult {
  pass: boolean
  _key?: never
  [key: string]: any
}

export type ViewableResult = boolean | DetailedViewableResult

export interface ViewableApiResult {
  pass: boolean
  _key?: string
  [key: string]: any
}

export function defineIsViewable(fn: (context: ViewableContext) => Promisable<ViewableResult>) {
  return fn
}
