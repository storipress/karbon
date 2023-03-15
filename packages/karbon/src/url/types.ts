import type { Resources } from '../runtime/types'

export interface StaticPart {
  type: 'static'
  value: string
}

export interface StaticParamPart {
  type: 'staticParam'
  paramName: string
}

export interface VariablePart {
  type: 'variable'
  isIdentifiable: boolean
  isOptional: boolean
  path: string[]
  paramName: string
}

export type URLPart = StaticPart | VariablePart | StaticParamPart

export interface RouteOptionsContext {
  id: VariablePart
  resource: Resources
  parts: URLPart[]
  staticParams: Record<string, string>
}
