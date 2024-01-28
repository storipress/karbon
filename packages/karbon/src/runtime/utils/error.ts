import { symbol } from 'zod'
import type { PayloadScope } from '../types'

export class KarbonError extends Error {
  name: string = 'KarbonError'
  httpStatus: number = 500

  constructor(message: string, errorOptions?: ErrorOptions) {
    super(message, errorOptions)
  }

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
  error?: any
}

export function isKarbonErrorMeta(error: any): error is KarbonErrorMeta {
  return error?.symbol === KarbonErrorSymbol
}
