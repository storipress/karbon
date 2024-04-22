import { CompactEncrypt, compactDecrypt } from '@storipress/jose-browser'

export async function createEncryptJWT(key: Uint8Array, plaintext: string) {
  const compactEncrypt = new CompactEncrypt(textToUint8Array(plaintext)).setProtectedHeader({
    enc: 'A256GCM',
    alg: 'dir',
  })
  return await compactEncrypt.encrypt(key)
}

export async function decryptJWT(key: Uint8Array, jwt: string) {
  const { plaintext } = await compactDecrypt(jwt, key)
  return uint8ArrayToText(plaintext)
}

export function textToUint8Array(text: string) {
  const encoder = new TextEncoder()
  return encoder.encode(text)
}

export function uint8ArrayToText(array: Uint8Array) {
  const decoder = new TextDecoder()
  return decoder.decode(array)
}
