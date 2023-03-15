import type { MetaMap } from '../types'
import { loadStoripressPayload, loadStoripressPayloadWithURL, useStaticAsyncState } from '#imports'
import urls from '#build/storipress-urls.mjs'

const DEFAULT_RESOURCE = new Set(['article', 'author', 'desk', 'tag'])

export async function getTagGroup(groupKey: string) {
  const group = await loadStoripressPayloadWithURL('_custom-field-group')
  const tagsIdentityList = group[groupKey]

  return tagsIdentityList
}

export function useTagGroup(groupKey: string) {
  const tagCollectionResource = Object.fromEntries(
    Object.entries(urls)
      .filter(([key, _value]) => !DEFAULT_RESOURCE.has(key))
      .map(([_key, value]) => [value.groupKey, value])
  )
  if (!tagCollectionResource[groupKey]) {
    throw new Error(`Could not find groupKey "${groupKey}", check if it is set in nuxt.config`)
  }

  return useStaticAsyncState('tagGroup', async () => {
    const tagsIdentityList = await getTagGroup(groupKey)
    const tagsIdMap = new Set(tagsIdentityList)
    const tagList = await loadStoripressPayload<(MetaMap['tag'] & { name: string })[]>('tags', '__all')
    const result = tagList
      .filter((meta) => tagsIdMap.has(meta.id))
      .map((meta) => {
        const url = tagCollectionResource[groupKey].toURL(meta, tagCollectionResource[groupKey]._context)
        const { id, name } = meta
        return {
          id,
          name,
          url,
        }
      })
    return result
  })
}
