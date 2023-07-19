import { getHeader } from 'h3'
import { BYPASS_CACHE_HEADER, INVALID_CACHE_HEADER } from '../constants'

export function shouldBypassCache(event: any) {
  return Boolean(getHeader(event, BYPASS_CACHE_HEADER))
}

export function shouldInvalidCache(event: any) {
  return Boolean(getHeader(event, INVALID_CACHE_HEADER))
}
