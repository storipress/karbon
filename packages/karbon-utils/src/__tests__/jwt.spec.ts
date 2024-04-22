import '../crypto-polyfill'
import { describe, expect } from 'vitest'
import { fc, it } from '@fast-check/vitest'
import { createEncryptJWT, decryptJWT, textToUint8Array, uint8ArrayToText } from '../jwt'

describe('createEncryptJWT', () => {
  // Returns an encrypted JWT string when given a valid key and plaintext
  it('should return an encrypted JWT string when given a valid key and plaintext', async () => {
    const key = new Uint8Array(32)
    const plaintext = 'Hello, world!'
    const result = await createEncryptJWT(key, plaintext)
    expect(typeof result).toBe('string')
  })

  // Returns an error when given a key of incorrect length
  it('should return an error when given a key of incorrect length', async () => {
    const key = new Uint8Array(16)
    const plaintext = 'Hello, world!'
    await expect(createEncryptJWT(key, plaintext)).rejects.toThrowError()
  })
})

describe('createEncryptJWT & decryptJWT', () => {
  it.prop({ plaintext: fc.string(), key: fc.uint8Array({ minLength: 32, maxLength: 32 }) })(
    'can encrypt and decrypt',
    async ({ plaintext, key }) => {
      const result = await createEncryptJWT(key, plaintext)

      expect(typeof result).toBe('string')

      expect(result).not.toBe(plaintext)

      const decrypted = await decryptJWT(key, result)

      expect(decrypted).toBe(plaintext)
    },
  )
})

describe('textToUint8Array & uint8ArrayToText', () => {
  it.prop({ text: fc.string() })('can convert text to and from uint8array', ({ text }) => {
    const array = textToUint8Array(text)
    const result = uint8ArrayToText(array)
    expect(result).toBe(text)
  })
})
