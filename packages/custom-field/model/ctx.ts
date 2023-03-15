import type { InjectionKey } from 'vue'
import { getCurrentInstance, inject, provide } from 'vue'
import { createContext } from 'unctx'
import { CUSTOM_FIELD_KEY } from './constants'
import type { CustomFieldStorage } from './types'

export const storageCtx = createContext<CustomFieldStorage>()
export const globalCustomFieldCtx = createContext<Record<string, unknown>>()

export const CUSTOM_FIELD_STORAGE_KEY: InjectionKey<CustomFieldStorage> = Symbol('custom-field-storage')

export function useProvideFields(resource?: Record<string, any>) {
  const customFields = normalizeCustomField(resource)

  if (customFields) {
    useProvideFieldStorage(customFields)
  }
}

function normalizeCustomField(maybeCustomFields?: Record<string, any>): CustomFieldStorage | undefined {
  const fields = maybeCustomFields?.[CUSTOM_FIELD_KEY] ?? maybeCustomFields
  if (fields) {
    const globalCustomField = globalCustomFieldCtx.tryUse() || {}
    return wrapFieldAsStorage({ ...globalCustomField, ...fields })
  }
}

export function wrapFieldAsStorage(fields: Record<string, unknown>): CustomFieldStorage {
  return { s: fields } as CustomFieldStorage
}

export function useProvideFieldStorage(storage: CustomFieldStorage) {
  if (storage) {
    provide(CUSTOM_FIELD_STORAGE_KEY, storage)
  }
}

export function useFieldStorage(): CustomFieldStorage {
  if (getCurrentInstance()) {
    return inject(CUSTOM_FIELD_STORAGE_KEY, storageCtx.use, true)
  }

  return storageCtx.use()
}
