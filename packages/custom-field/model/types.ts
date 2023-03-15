import type { FieldStorage } from './field'

interface FieldAlias {
  [key: string]: string
}

export interface CustomFieldStorage {
  s: FieldStorage
  a: FieldAlias
}
