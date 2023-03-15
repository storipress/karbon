import invariant from 'tiny-invariant'
import { cleanDoubleSlashes, normalizeURL } from 'ufo'
import type { BaseMeta, ResourceID, ResourcePage, Resources } from '../runtime/types'
import type { RouteOptionsContext, URLPart, VariablePart } from './types'
import { toRoute } from './parser'
import { paramNameToParamKey } from './utils'
import { extractURLParam } from './extractor'

const PREFER_IDENTITY = ['id', 'sid', 'slug']

export function convertToOption(
  resource: Resources,
  parts: URLPart[],
  staticParams = {}
): ResourcePage<BaseMeta, RouteOptionsContext> {
  const id = findIdentity(parts)
  return {
    enable: true,
    route: toRoute(parts),

    getIdentity: (params, ctx) => {
      const identity = ctx.id.path[0]
      const paramName = paramNameToParamKey(ctx.id.paramName)
      return { type: ctx.resource, [identity]: params[paramName] } as ResourceID
    },

    isValid: (params, meta, ctx) => {
      for (const part of ctx.parts) {
        if (part.type === 'variable' && !part.isIdentifiable) {
          const expectedValue = extractURLParam(meta, part, ctx)
          const key = paramNameToParamKey(part.paramName)
          if (params[key] !== expectedValue) {
            if (!params[key] && expectedValue === null && part.isOptional) {
              continue
            }
            return false
          }
        }
      }
      return true
    },

    toURL: (meta, ctx) => {
      const url = ctx.parts
        .map((part) => {
          if (part.type === 'static') {
            return part.value
          }
          if (part.type === 'staticParam') {
            return ctx.staticParams[paramNameToParamKey(part.paramName)]
          }
          return extractURLParam(meta, part, ctx)
        })
        .join('')
      return cleanDoubleSlashes(normalizeURL(url))
    },

    _context: {
      id,
      resource,
      parts,
      staticParams,
    },
  }
}

function findIdentity(parts: URLPart[]): VariablePart {
  const identities = new Map<string, VariablePart>()
  for (const part of parts) {
    if (part.type !== 'variable' || part.isIdentifiable !== true) {
      continue
    }
    invariant(part.path.length === 1)
    identities.set(part.path[0], part)
  }
  const idName = PREFER_IDENTITY.find((identity) => identities.get(identity))
  // TODO: verify + better error message
  invariant(idName)
  const idPart = identities.get(idName)
  invariant(idPart)
  return idPart
}
