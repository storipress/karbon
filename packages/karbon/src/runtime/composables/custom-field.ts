import { destr } from 'destr'
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
  if (articleId) return { type: 'article', id: articleId }
  if (deskId) return { type: 'desk', id: deskId }
  if (tagId) return { type: 'tag', id: tagId }
  if (userId) return { type: 'author', id: userId }

  return null as never
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

  if (type === FieldType.Select) {
    return computed(() => {
      const selValue = field.value as string[]

      return selValue.map((str) => {
        const valueObject = destr(str) ?? {}
        return Object.values(valueObject)[0]
      })
    })
  }

  return field
}

export { FieldType }
