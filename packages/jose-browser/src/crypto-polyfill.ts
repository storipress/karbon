import nodeCrypto from 'node:crypto'

if (!globalThis.crypto) {
  // polyfill global crypto
  // @ts-expect-error polyfill type not match
  globalThis.crypto = nodeCrypto.webcrypto
  // @ts-expect-error polyfill type not match
  globalThis.CryptoKey = nodeCrypto.webcrypto.CryptoKey
}
