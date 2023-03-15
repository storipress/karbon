import type { FieldType } from './field'
import { isValidType } from './field'

export interface ParsedPath {
  key: string
  type: FieldType
}

export function parsePath(path: string): ParsedPath | null {
  const [key, type] = path.split('::')
  if (!isValidType(type)) {
    return null
  }
  return { key, type }
}
