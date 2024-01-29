import type { PayloadScope } from '../types'

export class KarbonError extends Error {
  name = 'KarbonError'
  httpStatus = 500

  setHttpStatus(code: number) {
    this.httpStatus = code
  }
}

export function isKarbonError(error: unknown): error is KarbonError {
  return error instanceof KarbonError
}

export const KarbonErrorSymbol = Symbol('KarbonError')

export interface KarbonErrorMeta {
  payloadScope?: PayloadScope
  function?: string
  symbol: typeof KarbonErrorSymbol
  httpStatus?: number
  message: string
  stack?: string
  error?: unknown
}

export function isKarbonErrorMeta(error: unknown): error is KarbonErrorMeta {
  const _error = error as KarbonErrorMeta
  return _error?.symbol === KarbonErrorSymbol
}
