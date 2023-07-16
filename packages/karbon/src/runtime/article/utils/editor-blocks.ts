import { mapKeys, mapValues, pipe } from 'remeda'
import { snakeCase } from 'scule'
import { basename } from 'pathe'

export const editorBlocks = pipe(
  import.meta.glob('~~/templates/editor-blocks/*.vue', { eager: true }),
  mapKeys((name) => snakeCase(basename(name, '.vue'))),
  mapValues((mod) => (mod as any).default),
)
