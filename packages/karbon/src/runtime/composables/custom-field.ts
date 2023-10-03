import type { UseFieldOptions, UseFieldReturn } from '@storipress/custom-field'
import { FieldType, useField as _useField, normalizeOptions } from '@storipress/custom-field'
import type { ResourceID } from '../types'
import { useResourceResolver } from './resources'

interface ReferenceValue {
  articleId?: string
  deskId?: string
  tagId?: string
  userId?: string
}

function getReferenceResourceID({ articleId, deskId, tagId, userId }: ReferenceValue = {}): ResourceID {
  switch (true) {
    case Boolean(deskId):
      return { type: 'desk', id: deskId! }
    case Boolean(tagId):
      return { type: 'tag', id: tagId! }
    case Boolean(userId):
      return { type: 'author', id: userId! }
    case Boolean(articleId):
    default:
      return { type: 'article', id: articleId! }
  }
}

export function useField(key: string): UseFieldReturn<undefined, false>
export function useField<Type extends FieldType>(key: string, type: Type): UseFieldReturn<Type, false>
export function useField<Type extends FieldType, IsAll extends boolean>(
  key: string,
  type: Type,
  all: IsAll,
): UseFieldReturn<Type, IsAll>
export function useField<Type extends FieldType, IsAll extends boolean>(
  key: string,
  options: UseFieldOptions<Type, IsAll>,
  _all?: IsAll,
): UseFieldReturn<Type, IsAll>
export function useField(
  key: string,
  type_?: FieldType | UseFieldOptions<FieldType, boolean>,
  all_ = false,
): Ref<unknown> {
  const { type } = normalizeOptions(type_, all_)

  const field = _useField(key, type_ as FieldType, all_)
  if (!field.value) return field

  if (type === FieldType.Ref) {
    const { resolveFromID } = useResourceResolver()

    const { data } = useAsyncData(
      'resourceMeta',
      async () => {
        const refValue = field.value as ReferenceValue[]
        const promises = refValue.map((value) => {
          const resourceID = getReferenceResourceID(value)
          return resolveFromID(resourceID)
        })
        return await Promise.all(promises)
      },
      {
        watch: [field],
      },
    )

    return computed(() => {
      return data.value?.map((resource) => resource?.meta)
    })
  }

  return field
}

export { FieldType }
