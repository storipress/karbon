export type PayloadScope = 'posts' | 'tags' | 'desks' | 'authors'
export type Resources = 'article' | 'desk' | 'tag' | 'author'
export type Identity = 'id' | 'slug' | 'sid'

export interface Identifiable {
  id: string
}

type BaseID<Type extends URLKeys> =
  | {
      type: Type
      id: string
    }
  | {
      type: Type
      slug: string
    }

export type ArticleID =
  | BaseID<'article'>
  | {
      type: 'article'
      sid: string
    }

export type DeskID = BaseID<'desk'>
export type AuthorID = BaseID<'author'>
export type TagID = BaseID<'tag'>

export type ResourceID = ArticleID | DeskID | AuthorID | TagID

export interface ResourcePageContext {
  resource: Resources
  identity: Identity
  prefix: string
}

export interface ResourcePage<Meta extends Identifiable> {
  route: string
  enable: boolean
  getIdentity(params: Record<string, string>, _context: ResourcePageContext): ResourceID
  isValid(params: Record<string, string>, resource: Meta, _context: ResourcePageContext): boolean
  toURL(resource: Meta, _context: ResourcePageContext): string
  _context?: ResourcePageContext
  groupKey?: string
}

interface BaseMeta {
  id: string
  slug: string
}

export type ArticleMeta = BaseMeta
export type DeskMeta = BaseMeta
export type AuthorMeta = BaseMeta
export type TagMeta = BaseMeta

const urls: {
  article: ResourcePage<ArticleMeta>
  desk: ResourcePage<DeskMeta>
  author: ResourcePage<AuthorMeta>
  tag: ResourcePage<TagMeta>
  [key: string]: ResourcePage<TagMeta>
}

declare module '#sp-internal/storipress-urls.mjs' {
  export default urls
}

export default urls
