import type { BaseMeta, ResourcePage, Resources } from '../runtime/types'
import { parse } from './parser'
import { convertToOption } from './to-options'
import type { RouteOptionsContext } from './types'

interface ResourceRouteOption {
  url: string
  resource: Resources
  groupKey?: string
  /**
   * @ignore
   */
  _staticParams?: Record<string, string>
}

export function createResourceRoute(opt: ResourceRouteOption): ResourcePage<BaseMeta, RouteOptionsContext> {
  return {
    ...convertToOption(opt.resource, parse(opt.url), opt._staticParams),
    groupKey: opt.groupKey,
  }
}

export function createArticleRoute(url: string) {
  const option: ResourceRouteOption = {
    resource: 'article',
    url,
  }
  return createResourceRoute(option)
}

export function createTagRoute(url: string) {
  const option: ResourceRouteOption = {
    resource: 'tag',
    url,
  }
  return createResourceRoute(option)
}

export function createTagCollectionRoute(url: string, groupKey: string) {
  const option: ResourceRouteOption = {
    resource: 'tag',
    url,
    groupKey,
  }
  return createResourceRoute(option)
}

export function createDeskRoute(url: string) {
  const option: ResourceRouteOption = {
    resource: 'desk',
    url,
  }
  return createResourceRoute(option)
}

export function createAuthorRoute(url: string) {
  const option: ResourceRouteOption = {
    resource: 'author',
    url,
  }
  return createResourceRoute(option)
}

export { GetResourcesOptionParams, UrlParams, getDeskTree, getResourcesOption } from './resources-option'
