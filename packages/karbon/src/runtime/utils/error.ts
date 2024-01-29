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

export interface KarbonErrorMeta {
  __isKarbonError: true
  payloadScope?: PayloadScope
  function?: string
  httpStatus?: number
  message: string
  stack?: string
  error?: unknown
}

export function isKarbonErrorMeta(error: unknown): error is KarbonErrorMeta {
  const _error = error as KarbonErrorMeta
  return Boolean(_error.__isKarbonError)
}
