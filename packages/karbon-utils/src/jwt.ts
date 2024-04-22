import { CompactEncrypt, compactDecrypt } from '@storipress/jose-browser'
import { textToUint8Array, uint8ArrayToText } from './encoding'

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
