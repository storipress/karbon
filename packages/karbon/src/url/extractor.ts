import invariant from 'tiny-invariant'
import { pathOr } from 'remeda'
import { verboseInvariant } from '../runtime/utils/verbose-invariant'
import type { RouteOptionsContext, VariablePart } from './types'

export const extractors: Record<string, (data: any, ctx: RouteOptionsContext) => string> = {
  year: (data) => {
    return extractDate(data).getFullYear().toString()
  },
  month: (data) => {
    return (extractDate(data).getMonth() + 1).toString().padStart(2, '0')
  },
  day: (data) => {
    return extractDate(data).getDate().toString().padStart(2, '0')
  },
  root_desk: (data) => {
    return data.desk.desk || data.desk
  },
  sub_desk: (data) => {
    return data.desk.desk ? data.desk : null
  },
}

function extractDate(data: any) {
  invariant(data.published_at)
  const date = new Date(data.published_at)
  return date
}

export function extractURLParam(meta: any, part: VariablePart, ctx: RouteOptionsContext): string | null {
  let current = meta

  for (const key of part.path) {
    const extractor = extractors[key] || ((current: any) => pathOr(current, [key], null))
    current = extractor(current, ctx)
    if (current === null && part.isOptional) {
      break
    }
  }

  verboseInvariant(part.isOptional || current !== null, `non-optional part not found in meta for ${part.paramName}`)
  verboseInvariant(
    current === null || (current && typeof current === 'string'),
    `part ${part.paramName} is not a string`,
  )

  return current
}
