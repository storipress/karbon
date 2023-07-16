import { mapKeys, mapValues, pipe } from 'remeda'
import { snakeCase } from 'scule'
import { basename } from 'pathe'

export const templates = pipe(
  import.meta.glob('~~/templates/article-layouts/*.vue', { eager: true }),
  mapKeys((name) => snakeCase(basename(name, '.vue'))),
  mapValues((mod) => (mod as any).default),
)
