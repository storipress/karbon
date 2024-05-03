import { Buffer } from 'node:buffer'
import { describe, expect } from 'vitest'
import { fc, it } from '@fast-check/vitest'
import { base64ToUint8Array, textToUint8Array, uint8ArrayToBase64, uint8ArrayToText } from '@storipress/karbon-utils'

describe('textToUint8Array & uint8ArrayToText', () => {
  it.prop({ text: fc.string() })('can convert text to and from uint8array', ({ text }) => {
    const array = textToUint8Array(text)
    const result = uint8ArrayToText(array)
    expect(result).toBe(text)
  })
})

describe('base64ToUint8Array', () => {
  it.prop({ s: fc.string() })('can convert base64 to Uint8Array', ({ s }) => {
    const base64 = Buffer.from(s).toString('base64')
    expect(Buffer.from(base64ToUint8Array(base64)).toString()).toEqual(s)
  })
})

describe('base64ToUint8Array & uint8ArrayToBase64', () => {
  it.prop({ s: fc.string() })('can convert base64 string from and to uint8array', ({ s }) => {
    const base64 = Buffer.from(s).toString('base64')
    expect(uint8ArrayToBase64(base64ToUint8Array(base64))).toEqual(base64)
  })
})

describe('uint8ArrayToBase64 & base64ToUint8Array', () => {
  it.prop(
    {
      array: fc.uint8Array({
        minLength: 157223,
      }),
    },
    // This is a large test, make it faster
    { numRuns: 5 },
  )('can convert base64 string from and to uint8array', ({ array }) => {
    expect(base64ToUint8Array(uint8ArrayToBase64(array))).toEqual(array)
  })
})
