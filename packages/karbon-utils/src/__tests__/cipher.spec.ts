import '../crypto-polyfill'

import { Buffer } from 'node:buffer'
import { describe, expect } from 'vitest'
import { fc, it } from '@fast-check/vitest'
import { base64ToUint8Array, createDecrypt, createEncrypt } from '../cipher'

describe('createEncrypt & createDecrypt', () => {
  it.prop({ plaintext: fc.string() })('can encrypt and decrypt', async ({ plaintext }) => {
    const { key, iv, content } = await createEncrypt(plaintext)
    const { decrypt } = createDecrypt(key, iv)

    await expect(decrypt(content)).resolves.toBe(plaintext)
  })
})

describe('base64ToUint8Array', () => {
  it.prop({ s: fc.string() })('can convert base64 to Uint8Array', ({ s }) => {
    const base64 = Buffer.from(s).toString('base64')
    expect(Buffer.from(base64ToUint8Array(base64)).toString()).toEqual(s)
  })
})
