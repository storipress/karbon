import { values } from 'remeda'

export enum FieldType {
  Text = 'TEXT',
  Number = 'NUM',
  Bool = 'BOOL',
  File = 'FILE',
  URL = 'URL',
  Color = 'COLOR',
  Date = 'DATE',
  RichText = 'RICHTEXT',
  Json = 'JSON',
  Ref = 'REF',
  Select = 'SELECT',
}

export interface FieldTypeMap {
  [FieldType.Text]: string
  [FieldType.Number]: number
  [FieldType.Bool]: boolean
  [FieldType.File]: string
  [FieldType.URL]: string
  [FieldType.Color]: string
  [FieldType.Date]: Date
  [FieldType.RichText]: unknown
  [FieldType.Json]: unknown
  [FieldType.Ref]: unknown
  [FieldType.Select]: unknown
}

const VALID_TYPE = new Set<string>(values(FieldType))

export function isValidType(x: string): x is FieldType {
  return VALID_TYPE.has(x)
}

export type FieldStorage = Record<string, any>
