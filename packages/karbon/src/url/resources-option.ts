import type { ArticleMeta, AuthorMeta, DeskMeta, ResourceID, ResourcePage, Resources, TagMeta } from '../runtime/types'

export enum UrlParams {
  Desks = 'desks',
  Identity = 'identity',
}

export interface GetResourcesOptionParams<Meta extends ArticleMeta | DeskMeta | AuthorMeta | TagMeta> {
  type?: 'desk' | 'group'
  prefix?: string
  resource: Resources
  identity?: 'id' | 'slug' | 'sid'
  isValid?: (params: Record<UrlParams, string>, resource: Meta) => boolean
  groupKey?: string
}

export function getResourcesOption<Meta extends ArticleMeta | DeskMeta | AuthorMeta | TagMeta>(
  { type, prefix, resource, isValid, identity = 'id', groupKey }: GetResourcesOptionParams<Meta> = {
    resource: 'article',
  }
): ResourcePage<Meta> {
  const urlPrefix = prefix ? `/${prefix}` : ''

  switch (type) {
    case 'desk':
      return {
        route: `${urlPrefix}/:${UrlParams.Desks}/:${UrlParams.Identity}`,
        enable: true,
        getIdentity: ({ identity }, ctx) => ({ type: ctx.resource, [ctx.identity]: identity } as ResourceID),
        isValid:
          isValid ??
          (({ desks }, meta) => {
            const { desk } = meta as ArticleMeta
            const name = desk.name?.toLocaleLowerCase()
            const slug = desk.slug?.toLocaleLowerCase()
            const urlDesksParams = desks?.toLocaleLowerCase()

            return urlDesksParams === slug || urlDesksParams === name
          }),
        toURL: (meta, ctx) => {
          const { desk } = meta as ArticleMeta
          const { name, slug } = desk
          const deskUrl = slug || name
          return `${ctx.prefix}/${deskUrl || 'desk'}/${meta[ctx.identity]}`
        },
        _context: { identity, resource, prefix: urlPrefix },
      }
    case 'group':
      return {
        route: `${urlPrefix}/:${UrlParams.Identity}`,
        enable: true,
        getIdentity: ({ identity }, ctx) => ({ type: ctx.resource, [ctx.identity]: identity } as ResourceID),
        isValid: isValid ?? (() => true),
        toURL: (meta, ctx) => `${ctx.prefix}/${meta[ctx.identity]}`,
        _context: { identity, resource, prefix: urlPrefix },
        groupKey,
      }

    default:
      return {
        route: `${urlPrefix}/:${UrlParams.Identity}`,
        enable: true,
        getIdentity: ({ identity }, ctx) => ({ type: ctx.resource, [ctx.identity]: identity } as ResourceID),
        isValid: isValid ?? (() => true),
        toURL: (meta, ctx) => `${ctx.prefix}/${meta[ctx.identity]}`,
        _context: { identity, resource, prefix: urlPrefix },
      }
  }
}

export function getDeskTree(desk?: ArticleMeta['desk'], result: string[] = []): string[] {
  if (!desk) return result

  const { name, slug, desk: parentDesk } = desk
  if (!parentDesk) return [slug || name, ...result]

  return getDeskTree(parentDesk, [slug || name, ...result])
}
