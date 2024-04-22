import '../crypto-polyfill'

import { describe, expect } from 'vitest'
import { fc, it } from '@fast-check/vitest'
import { createDecrypt, createEncrypt } from '../cipher'

describe('createEncrypt & createDecrypt', () => {
  it.prop({ plaintext: fc.string() })('can encrypt and decrypt', async ({ plaintext }) => {
    const { key, iv, content } = await createEncrypt(plaintext)
    const { decrypt } = createDecrypt(key, iv)

    await expect(decrypt(content)).resolves.toBe(plaintext)
  })
})
