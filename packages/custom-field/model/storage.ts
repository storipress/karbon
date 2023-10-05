import { flatMap, fromPairs, keys, pipe } from 'remeda'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import type { CustomFieldStorage } from './types'
import type { FieldType, FieldTypeMap } from './field'
import { parsePath } from './path'
import { useFieldStorage } from './ctx'
import { storageHooks } from './hooks'

export type UseFieldReturn<Type, IsAll extends boolean> = Type extends FieldType
  ? IsAll extends true
    ? Ref<FieldTypeMap[Type][]>
    : Ref<FieldTypeMap[Type]>
  : IsAll extends true
  ? Ref<unknown[]>
  : Ref<unknown>

export interface UseFieldOptions<Type extends FieldType, IsAll extends boolean> {
  type?: Type
  all?: IsAll
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
  const { type, all } = normalizeOptions(type_, all_)
  storageHooks.callHookParallel('field:read', key, type)

  const storage = useFieldStorage()

  const getKey = () => resolveKey(storage, type ? concatType(key, type) : key)
  const k = ref(getKey())

  watch(
    () => storage.s,
    () => {
      k.value = getKey()
    },
    { deep: true },
  )

  if (all) {
    return computed(() => {
      return storage.s?.[k.value]
    })
  }

  return computed(() => {
    return storage.s?.[k.value]?.[0]
  })
}

export function normalizeOptions<Type extends FieldType, IsAll extends boolean = false>(
  type?: Type | UseFieldOptions<Type, IsAll>,
  all?: IsAll,
): UseFieldOptions<Type, IsAll> {
  if (typeof type === 'object') {
    return type
  }

  return {
    type,
    all,
  }
}

function concatType(key: string, type: FieldType): string {
  return `${key}::${type}`
}

function resolveKey(storage: CustomFieldStorage, key: string): string {
  if (!storage.a || !storage.a[key]) {
    resolveAlias(storage)
  }
  return storage.a[key]
}

function resolveAlias(storage: CustomFieldStorage) {
  storage.a = pipe(
    storage.s || {},
    keys,
    flatMap((originalKey): [string, string][] => {
      const parsed = parsePath(originalKey)
      const originalPair: [string, string] = [originalKey, originalKey]
      return parsed ? [[parsed.key, originalKey], originalPair] : [originalPair]
    }),
    fromPairs<string>,
  )
}
