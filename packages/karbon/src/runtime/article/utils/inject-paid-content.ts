import { gcm } from '@noble/ciphers/webcrypto/aes'
import type { ViewableApiResult } from '../../composables/viewable'
import type { PaidSegment, Segment } from '../../lib/split-article'
import { executeScriptElements } from './execute-script'

function base64ToUint8Array(s: string) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

const decryptedSet = new WeakSet()

export async function decryptPaidContent(
  contentKey: string,
  rawIv: number[],
  segments: Segment[],
  getDecryptKey: (key: string) => Promise<ViewableApiResult>,
) {
  try {
    const verifyResult = await getDecryptKey(contentKey ?? '')
    if (!verifyResult._key) {
      return segments
    }
    const key = base64ToUint8Array(verifyResult._key ?? '')
    const iv = new Uint8Array(rawIv)
    // passing the third parameter is to avoid the TypeError: additionalData: Not a BufferSource
    const cipher = gcm(key, iv, new Uint8Array(0))
    const decryptSegment = await Promise.all(
      segments.map(async (segment) => {
        if (segment.id !== 'paid') return segment

        const content = base64ToUint8Array((segment as PaidSegment).paidContent)
        const decrypted = await cipher.decrypt(content)
        const decoder = new TextDecoder('utf-8')
        const html = decoder.decode(decrypted)
        return {
          id: 'normal' as const,
          type: segment.type,
          html,
        }
      }),
    )
    return decryptSegment
  } catch (e) {
    return segments
  }
}

export function processingArticles(el: HTMLElement, fixArticleEmbed: () => void) {
  if (!el || decryptedSet.has(el)) {
    return false
  }
  executeScriptElements(el)
  fixArticleEmbed()
  decryptedSet.add(el)
}
