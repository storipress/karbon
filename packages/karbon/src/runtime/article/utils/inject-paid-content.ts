import { base64ToUint8Array, createDecrypt } from '@storipress/karbon-utils'
import type { ViewableApiResult } from '../../composables/viewable'
import type { PaidSegment, Segment } from '../../lib/split-article'
import { executeScriptElements } from './execute-script'

const decryptedSet = new WeakSet()

export async function decryptPaidContent(
  contentKey: string,
  rawIv: string,
  segments: Segment[],
  getDecryptKey: (key: string) => Promise<ViewableApiResult>,
) {
  try {
    const verifyResult = await getDecryptKey(contentKey ?? '')
    if (!verifyResult._key) {
      return segments
    }
    const key = base64ToUint8Array(verifyResult._key ?? '')
    const iv = base64ToUint8Array(rawIv)
    const { decrypt } = createDecrypt(key, iv)
    const decryptSegment = await Promise.all(
      segments.map(async (segment) => {
        if (segment.id !== 'paid') return segment

        const content = base64ToUint8Array((segment as PaidSegment).paidContent)
        const html = await decrypt(content)
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
