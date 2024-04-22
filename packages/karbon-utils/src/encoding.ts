export function base64ToUint8Array(s: string) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

export function uint8ArrayToBase64(array: Uint8Array) {
  return btoa(String.fromCharCode(...array))
}

export function textToUint8Array(text: string) {
  const encoder = new TextEncoder()
  return encoder.encode(text)
}

export function uint8ArrayToText(array: Uint8Array) {
  const decoder = new TextDecoder()
  return decoder.decode(array)
}
