import { Buffer } from 'node:buffer'
import { destr } from 'destr'
import { base64ToUint8Array, decryptJWT } from '@storipress/karbon-utils'
import { DECRYPT_AUTH_HEADER, DECRYPT_KEY_HEADER } from '@storipress/karbon/internal'
import { defineEventHandler, getHeader, isMethod, readBody, setResponseStatus } from 'h3'
import type {
  DetailedViewableResult,
  ViewableApiResult,
  ViewableResult,
  defineIsViewable,
} from '../../composables/viewable'

import { verboseInvariant } from '../../utils/verbose-invariant'

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
  if (!isMethod(event, ['HEAD', 'OPTIONS', 'GET', 'POST'])) {
    setResponseStatus(event, 405, 'Method not allowed')
    return {
      pass: false,
      message: 'Method not allowed',
    }
  }
  const { auth, key } = await extractParam(event)

  const { storipress } = useRuntimeConfig()

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
    const encryptKey = (storipress as any).encryptKey as string
    // eslint-disable-next-line no-console
    console.log('encrypt key', encryptKey)
    const plaintext = await decryptJWT(base64ToUint8Array(encryptKey), key)
    meta = destr(plaintext)
    // eslint-disable-next-line no-console
    console.log('decrypt meta:', meta)
    verboseInvariant(meta.id && meta.plan && meta.key, 'invalid body')
  } catch (error) {
    console.error(error)
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

interface RawBody {
  auth: string
  key: string
}

async function extractParam(event: any) {
  const rawAuthHeader = getHeader(event, DECRYPT_AUTH_HEADER)
  const rawKeyHeader = getHeader(event, DECRYPT_KEY_HEADER)
  const body = isMethod(event, 'POST') ? await readBody<RawBody>(event) : undefined
  const auth: Record<string, unknown> = destr(decodeBase64(body?.auth ?? rawAuthHeader))
  const key: string | undefined = body?.key ?? rawKeyHeader
  return { auth, key }
}

function normalizeViewableResult(res: ViewableResult): DetailedViewableResult {
  if (res == null) {
    console.error(
      "defineIsViewable return `null` or `undefined` will be implicit convert to `{ pass: false }`, but it's not recommend to rely on this behavior",
    )
    res = false
  }
  if (typeof res === 'boolean') {
    return { pass: res }
  }
  return res
}

function decodeBase64(str: string | undefined = ''): string {
  return str ? Buffer.from(str, 'base64').toString() : ''
}
