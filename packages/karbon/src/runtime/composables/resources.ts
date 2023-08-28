import type { AsyncData } from 'nuxt/dist/app/composables'
import type { Ref } from 'vue'
import type { BaseMeta, IdComparisonMap, MetaMap, PayloadScope, ResourceID, Resources } from '../types'
import { invalidContext } from '../utils/invalid-context'
import urls from '#build/storipress-urls.mjs'
import { computed, loadStoripressPayload, loadStoripressPayloadWithURL, useAsyncData } from '#imports'

const KEY_TO_SCOPE: Record<Resources, PayloadScope> = {
  article: 'posts',
  author: 'authors',
  desk: 'desks',
  tag: 'tags',
}

type ResourceIDWithURL<Type extends Resources> = ResourceID & { url: string; meta: MetaMap[Type] }

interface ResourceTransformOptions<Type extends Resources, Return = ResourceIDWithURL<Type>> {
  key: string
  transform: (x: ResourceIDWithURL<Resources>[]) => Return[]
}

type UseResourceListOptions<Type extends Resources, Return = ResourceIDWithURL<Type>> =
  | { key?: string; transform?: undefined }
  | ResourceTransformOptions<Type, Return>

export function useResourceList<Type extends Resources, Return = ResourceIDWithURL<Type>>(
  resource: Type,
  opt: UseResourceListOptions<Type, Return> = {},
): AsyncData<Return[], true | null> {
  return useAsyncData(
    `sp-resource-list-${resource}${opt.key ? `:${opt.key}` : ''}`,
    async () => {
      const list = await loadStoripressPayload<MetaMap[Type][]>(KEY_TO_SCOPE[resource], '__all')
      return list.map(
        (meta) =>
          ({
            type: resource,
            id: meta.id,
            ...resolveFromResourceMetaSync(resource, meta),
          }) as ResourceIDWithURL<Type>,
      )
    },
    {
      transform: opt.transform,
    },
  )
}

export type ResourceWithURL<T extends BaseMeta> = T & {
  url: string
}

export interface UseResourceReturn<T extends BaseMeta> {
  pending: Ref<boolean>
  data: Ref<T[] | null>
}

export function _useResource<TResource extends BaseMeta>(
  resourceName: Resources,
  mapper: (x: TResource) => TResource,
): UseResourceReturn<TResource> {
  const res = useResourceList(resourceName)
  return {
    ...res,
    data: computed(
      () =>
        res.data.value?.map((item) => {
          return mapper({
            ...item.meta,
            url: item.url,
          } as unknown as TResource)
        }) ?? null,
    ),
  }
}

export function useResourceResolver() {
  return {
    resolveFromID: resolveResource,
    resolveFromResource: resolveFromResourceMetaSync,
    resolveAsID,
    resolveFromResourceMeta,
    resolveAsRef,
    _getContextFor: getContextFor,
    _resolveFromMetaSync: resolveFromResourceMetaSync,
  }
}

function resolveAsRef(key: string, resourceID: ResourceID) {
  return useAsyncData(key, () => resolveResource(resourceID))
}

async function resolveResource(resourceID: ResourceID, params?: Record<string, string>, resourceName?: string) {
  const { type } = resourceID
  const resource = resourceName || type
  const id = await resolveAsID(resourceID)
  if (!id) {
    return null
  }
  const meta = await getResourceMeta(KEY_TO_SCOPE[type], id)
  return resolveFromResourceMeta(resource, meta, params)
}

async function resolveAsID(resourceID: ResourceID): Promise<string | null> {
  return convertToId(KEY_TO_SCOPE[resourceID.type], resourceID)
}

async function resolveFromResourceMeta(type: Resources | string, meta: BaseMeta, params?: Record<string, string>) {
  const { groupKey } = urls[type]
  if (groupKey) {
    const isValidTag = await findGroupTags(groupKey, meta.id)

    if (!isValidTag) {
      return null
    }
  }

  return resolveFromResourceMetaSync(type, meta, params)
}

function resolveFromResourceMetaSync(type: Resources | string, meta: BaseMeta, params?: Record<string, string>) {
  const ctx = getContextFor(type)

  const isValidUrl = params ? urls[type].isValid(params, meta, ctx) : true

  if (!meta || !isValidUrl) {
    return null
  }

  return {
    meta,
    url: urls[type].toURL(meta, ctx),
  }
}

async function getResourceMeta<Meta extends BaseMeta>(scope: PayloadScope, id: string): Promise<Meta> {
  const meta = await loadStoripressPayload<Meta>(scope, id)

  return meta
}

function getContextFor(type: Resources | string) {
  return urls[type]._context ?? invalidContext
}

async function convertToId(scope: PayloadScope, resourceID: any): Promise<string | null> {
  const { id, slug, sid } = resourceID
  if (id) {
    return id
  }
  const idComparisonMap = await loadStoripressPayload<IdComparisonMap>(scope, '__map', true)
  return (slug ? idComparisonMap.slugs[slug] : idComparisonMap.sids[sid]) ?? null
}

async function findGroupTags(groupKey: string, id: string) {
  const group = await loadStoripressPayloadWithURL('_custom-field-group')
  const tags = group[groupKey]
  return  tags?.includes(id)
}
