import { filter, first, pipe } from 'remeda'
import { setHeader, setResponseStatus } from 'h3'
import { FieldType } from '@storipress/custom-field'
import type { ApolloError } from '@apollo/client/core/index.js'
import type { Errors } from '@storipress/typesense-xior'
import type { Identifiable, PayloadScope } from '../types'
import type { KarbonErrorMeta } from '../utils/error'
import { isKarbonErrorMeta } from '../utils/error'
import {
  ALL_RESOURCE_JSON_PATH,
  ALL_RESOURCE_PATH,
  CUSTOM_FIELD_EDITOR_BLOCK_KEY,
  CUSTOM_FIELD_KEY,
  ID_COMPARISON_MAP,
} from '../constants'
import { NOT_FOUND, defineSnapshotHandler } from './snapshot-handler'
import { shouldBypassCache } from './cache-control'

type CustomFieldType =
  | 'text'
  | 'number'
  | 'color'
  | 'url'
  | 'boolean'
  | 'richText'
  | 'file'
  | 'date'
  | 'json'
  | 'reference'
  | 'select'
enum FieldTypeMap {
  boolean = 'Bool',
  color = 'Color',
  date = 'Date',
  file = 'File',
  json = 'Json',
  number = 'Number',
  richText = 'RichText',
  text = 'Text',
  url = 'URL',
  reference = 'Ref',
  select = 'Select',
}
interface MetaFieldValue {
  __typename: string
  id: string
  [value: string]: string | number | boolean | Date | unknown
}
interface MetaFields {
  id: string
  key: string
  type: CustomFieldType
  values: MetaFieldValue[]
  group: {
    id: string
    key: string
  }
}

interface ValueMap {
  value: string | number | boolean | Date
  fieldKey: string
}

export interface DefinePayloadHandlerInput<T extends Identifiable> {
  payloadScope: PayloadScope
  listAll: (bypassCache: boolean) => Promise<T[]>
  getOne: (id: string) => Promise<T | undefined | null>
  /**
   * hash all items to generate Etag
   */
  listHash?: (list: T[]) => string
}

export function definePayloadHandler<T extends Identifiable>({
  payloadScope,
  listAll,
  getOne,
  listHash,
}: DefinePayloadHandlerInput<T>): any {
  return defineSnapshotHandler(async (name, event) => {
    async function handleListAll(bypassCache: boolean): Promise<T[] | KarbonErrorMeta> {
      return await listAll(bypassCache).catch((error: ApolloError | Errors.TypesenseError) => {
        const networkError = (error as ApolloError)?.networkError as { statusCode: number }
        const statusCode = networkError?.statusCode
        const httpStatus = (error as Errors.TypesenseError)?.httpStatus ?? statusCode ?? 500
        setResponseStatus(event, httpStatus, error?.message)

        return {
          __isKarbonError: true,
          payloadScope,
          function: `defineSnapshotHandler > callback > handleListAll > name: ${name}`,
          httpStatus,
          message: error.message,
          stack: error.stack,
          error,
        }
      })
    }

    function setEtag(items: T[]) {
      if (listHash) {
        const hash = listHash(items)
        setHeader(event, 'etag', `W/"${hash}"`)
      }
    }

    const bypassCache = shouldBypassCache(event)
    if (name === ALL_RESOURCE_JSON_PATH) {
      const items = await handleListAll(bypassCache)
      if (isKarbonErrorMeta(items)) return items

      setEtag(items)
      return items
    }
    if (name === ALL_RESOURCE_PATH) {
      const items = await handleListAll(bypassCache)
      if (isKarbonErrorMeta(items)) return items

      setEtag(items)
      return items.map(({ id }) => id)
    }
    if (name === ID_COMPARISON_MAP) {
      const items = await handleListAll(true)
      if (isKarbonErrorMeta(items)) return items

      const initial = { slugs: {}, sids: {} }

      return items.reduce((target, { id, slug: _slug, sid }) => {
        const slug = decodeURIComponent(_slug ?? '')
        slug && Object.assign(target.slugs, { [slug]: id })
        sid && Object.assign(target.sids, { [sid]: id })
        return target
      }, initial)
    }

    try {
      const item = await getOne(name)
      if (!item) {
        return NOT_FOUND
      }

      const customField = getCustomFields((item as T & { metafields: MetaFields[] }).metafields || [])
      const contentBlock = sortEditorBlockValue((item as T & { content_blocks: MetaFields[] }).content_blocks || [])

      return {
        ...item,
        [CUSTOM_FIELD_KEY]: customField,
        [CUSTOM_FIELD_EDITOR_BLOCK_KEY]: contentBlock,
      }
    } catch (error) {
      console.error(error)
      return NOT_FOUND
    }
  })
}

function getCustomFields(metafields: MetaFields[]) {
  if (!metafields) {
    return {}
  }

  return Object.fromEntries(
    metafields.map((cur) => {
      const { concatType } = getCustomFieldKey(cur)

      const fieldValues = cur.values.length ? cur.values.map((value) => getFieldValue(value)) : []

      return [concatType, fieldValues] as const
    }),
  )
}

const SWITCH_VALUE_MAP: Record<string, string> = {
  CustomFieldNumberValue: 'numberValue',
  CustomFieldBooleanValue: 'booleanValue',
  CustomFieldJsonValue: 'jsonValue',
  CustomFieldRichTextValue: 'jsonValue',
  CustomFieldFileValue: 'fileValue',
  CustomFieldDateValue: 'dateValue',
  CustomFieldReferenceValue: 'referenceValue',
  CustomFieldSelectValue: 'selectValue',
}
function getFieldValue(value: MetaFieldValue) {
  const valueKey = SWITCH_VALUE_MAP[value.__typename]
  return valueKey ? value[valueKey] : value.value
}

function getCustomFieldKey(metafield: MetaFields) {
  const groupKey = metafield.group.key
  const fieldKey = metafield.key
  const type = FieldTypeMap[metafield.type]
  const fieldType = FieldType[type]
  const concatType = `${groupKey}.${fieldKey}::${fieldType}`

  return { groupKey, fieldKey, concatType }
}

function sortEditorBlockValue(metafields: MetaFields[]) {
  const valuesMap = metafields
    .filter((metafield) => metafield.key !== '__blocks')
    .reduce((acc, cur) => {
      const { concatType } = getCustomFieldKey(cur)

      if (cur.values.length) {
        for (const value of cur.values) {
          acc.set(value.id, { value: getFieldValue(value), fieldKey: concatType })
        }
      }

      return acc
    }, new Map())

  const blocksJson = metafields
    .filter((metafield) => metafield.key === '__blocks')
    .map((field) => {
      const val = findFirst(field.values, (x) => Boolean(x))
      if (val) {
        return getFieldValue(val) as string
      }
      return null
    })
  const blockJson = findFirst(blocksJson, (x) => Boolean(x))
  const blocks = blockJson ? JSON.parse(blockJson) : {}

  return Object.fromEntries(
    Object.entries(blocks).map(([uuid, values]) => [uuid, getEditorBlockValues(valuesMap, values as string[])]),
  )
}

function getEditorBlockValues(valuesMap: Map<string, ValueMap>, values: string[]) {
  const map = new Map()
  const dedupeSet = new Set()
  for (const valueId of values) {
    if (dedupeSet.has(valueId)) {
      continue
    }
    dedupeSet.add(valueId)
    if (valuesMap.has(valueId)) {
      const fieldKey = valuesMap.get(valueId)?.fieldKey
      const value = valuesMap.get(valueId)?.value
      map.has(fieldKey) ? map.get(fieldKey).push(value) : map.set(fieldKey, [value])
    }
  }
  return Object.fromEntries(map)
}

function findFirst<T>(values: T[], predice: (x: T) => boolean): T | undefined {
  return pipe(values, filter(predice), first())
}
