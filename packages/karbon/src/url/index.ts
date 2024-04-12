import type { BaseMeta, PageMeta, ResourcePage, Resources } from '../runtime/types'
import { parse } from './parser'
import { convertToOption } from './to-options'
import type { RouteOptionsContext } from './types'

interface ResourceRouteOption {
  url: string
  resource: Resources
  groupKey?: string
  meta?: PageMeta
  /**
   * @ignore
   */
  _staticParams?: Record<string, string>
}

type SimpleResourceRouteOption = Pick<ResourceRouteOption, 'meta'>

export function createResourceRoute(opt: ResourceRouteOption): ResourcePage<BaseMeta, RouteOptionsContext> {
  return {
    ...convertToOption(opt.resource, parse(opt.url), opt._staticParams),
    meta: opt.meta,
    groupKey: opt.groupKey,
  }
}

export function createArticleRoute(url: string, opt: SimpleResourceRouteOption = {}) {
  const option: ResourceRouteOption = {
    resource: 'article',
    url,
    ...opt,
  }
  return createResourceRoute(option)
}

export function createTagRoute(url: string, opt: SimpleResourceRouteOption = {}) {
  const option: ResourceRouteOption = {
    resource: 'tag',
    url,
    ...opt,
  }
  return createResourceRoute(option)
}

export function createTagCollectionRoute(url: string, groupKey: string, opt: SimpleResourceRouteOption = {}) {
  const option: ResourceRouteOption = {
    resource: 'tag',
    url,
    groupKey,
    ...opt,
  }
  return createResourceRoute(option)
}

export function createDeskRoute(url: string, opt: SimpleResourceRouteOption = {}) {
  const option: ResourceRouteOption = {
    resource: 'desk',
    url,
    ...opt,
  }
  return createResourceRoute(option)
}

export function createAuthorRoute(url: string, opt: SimpleResourceRouteOption = {}) {
  const option: ResourceRouteOption = {
    resource: 'author',
    url,
    ...opt,
  }
  return createResourceRoute(option)
}

export { type GetResourcesOptionParams, UrlParams, getDeskTree, getResourcesOption } from './resources-option'
