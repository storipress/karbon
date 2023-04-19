import destr from 'destr'
import invariant from 'tiny-invariant'
// @ts-expect-error self reference
import { DECRYPT_AUTH_HEADER, DECRYPT_KEY_HEADER, compactDecrypt } from '@storipress/karbon/internal'
import { defineEventHandler, getHeader } from 'h3'
import type {
  DetailedViewableResult,
  ViewableApiResult,
  ViewableResult,
  defineIsViewable,
} from '../../composables/viewable'
// @ts-expect-error auto generated module
import _isViewable from '#sp-internal/is-viewable'
// @ts-expect-error no useNitroApp
import { useNitroApp, useRuntimeConfig } from '#imports'

const isViewable: ReturnType<typeof defineIsViewable> = _isViewable

interface DecryptedKey {
  id: string
  plan: 'member' | 'subscriber'
  key: string
}

export default defineEventHandler(async (event): Promise<ViewableApiResult> => {
  const rawAuthHeader = getHeader(event, DECRYPT_AUTH_HEADER)
  const rawKeyHeader = getHeader(event, DECRYPT_KEY_HEADER)
  const { storipress } = useRuntimeConfig()
  const auth = destr(rawAuthHeader)
  const key = destr(rawKeyHeader)

  if (!auth) {
    return {
      pass: false,
      message: 'Missing auth info',
    }
  }
  if (!key) {
    return {
      pass: false,
      message: 'Empty body',
    }
  }
  let meta: DecryptedKey
  try {
    const { plaintext } = await compactDecrypt(key, Buffer.from(storipress.encryptKey, 'base64'))
    const decoder = new TextDecoder()
    meta = destr(decoder.decode(plaintext))
    invariant(meta.id && meta.plan && meta.key)
  } catch {
    return {
      pass: false,
      message: 'Invalid body',
    }
  }

  const nitro = useNitroApp()
  try {
    const rawResult = await isViewable({
      auth,
      meta,
      getArticle: async () => {
        const res = await nitro.localFetch(`/_storipress/posts/${meta.id}.json`, {
          method: 'GET',
        })
        return res.json()
      },
    })
    const result = normalizeViewableResult(rawResult)
    if (result.pass) {
      return {
        ...result,
        _key: meta.key,
      }
    }
    return result
  } catch (e) {
    console.error('isViewable throw error with:', e)
    return {
      pass: false,
      message: 'Internal error',
    }
  }
})

function normalizeViewableResult(res: ViewableResult): DetailedViewableResult {
  if (res === null) {
    console.error(
      "defineIsViewable return `null` or `undefined` will be implicit convert to `{ pass: false }`, but it's not recommend to rely on this behavior"
    )
    res = false
  }
  if (typeof res === 'boolean') {
    return { pass: res }
  }
  return res
}
