import { withoutTrailingSlash } from 'ufo'
import type { URLPart } from './types'

const IDENTIFIABLE_VAR = new Set(['id', 'sid', 'slug'])

export function parse(url: string) {
  return withoutTrailingSlash(url)
    .split(/(\{[^/}]+\})/)
    .filter((item) => item !== '')
    .map((item) => parsePart(item))
}

function parsePart(item: string): URLPart {
  if (item.startsWith('{') && item.endsWith('}')) {
    const inner = item.slice(1, -1)
    if (inner.startsWith('#')) {
      return {
        type: 'staticParam',
        paramName: `:${inner.slice(1)}`,
      }
    }
    const { isOptional, path } = parsePath(inner)
    return {
      type: 'variable',
      isIdentifiable: path.length === 1 && IDENTIFIABLE_VAR.has(path[0]),
      isOptional,
      path,
      paramName: pathToParamName(path, isOptional),
    }
  }

  return {
    type: 'static',
    value: item,
  }
}

function parsePath(inner: string) {
  const isOptional = inner.startsWith('?')
  const str = isOptional ? inner.slice(1) : inner
  return {
    isOptional,
    path: str.split('.'),
  }
}

function pathToParamName(path: string[], optional = false): string {
  const suffix = optional ? '?' : ''
  return `:_${path.join('_')}${suffix}`
}

export function toRoute(parts: URLPart[]): string {
  return parts.map((part) => partToRoute(part)).join('')
}

function partToRoute(part: URLPart): string {
  if (part.type === 'static') {
    return part.value
  }

  return part.paramName
}
