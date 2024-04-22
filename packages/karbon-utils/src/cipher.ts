import { gcm, randomBytes } from '@noble/ciphers/webcrypto'

export async function createEncrypt(plaintext: string) {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
  const key = await crypto.subtle.exportKey('raw', cryptoKey)
  const iv = randomBytes(12)
  const cipher = gcm(new Uint8Array(key), iv)
  const content = await cipher.encrypt(encoder.encode(plaintext))
  return {
    key: new Uint8Array(key),
    content,
    iv,
    encrypt: (plaintext: string) => cipher.encrypt(encoder.encode(plaintext)),
  }
}

export function createDecrypt(key: Uint8Array, iv: Uint8Array) {
  const cipher = gcm(key, iv, new Uint8Array(0))
  const decoder = new TextDecoder('utf-8')
  return {
    decrypt: async (encrypted: Uint8Array) => {
      const decrypted = await cipher.decrypt(encrypted)
      const text = decoder.decode(decrypted)
      return text
    },
  }
}
