import { createHooks } from 'hookable'
import type { FieldType } from './field'

interface Hooks {
  'field:read': (key: string, type?: FieldType) => Promise<void> | void
}

export const storageHooks = createHooks<Hooks>()
