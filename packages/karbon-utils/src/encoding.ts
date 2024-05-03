import { fromByteArray } from 'base64-js'

export function base64ToUint8Array(s: string) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

export function uint8ArrayToBase64(array: Uint8Array) {
  // Need to use third-party implement or it will fail on large array
  // ref: https://stackoverflow.com/a/57111228/3775132
  return fromByteArray(array)
}

export function textToUint8Array(text: string) {
  const encoder = new TextEncoder()
  return encoder.encode(text)
}

export function uint8ArrayToText(array: Uint8Array) {
  const decoder = new TextDecoder()
  return decoder.decode(array)
}
