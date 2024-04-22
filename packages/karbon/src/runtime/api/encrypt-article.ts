import { base64ToUint8Array, createEncrypt, createEncryptJWT, uint8ArrayToBase64 } from '@storipress/karbon-utils'
import { splitPaidContent } from '../lib/split-paid-content'
import type { NormalSegment, Segment } from '../lib/split-article'
import type { ArticlePlan } from '../types'

export interface EncryptArticleInput {
  id: string
  html: string
  plan: ArticlePlan
  segments: Segment[]
  encryptKey: string
  previewParagraph?: number
}
export async function encryptArticle({
  html,
  id,
  plan,
  segments,
  encryptKey,
  previewParagraph = 3,
}: EncryptArticleInput) {
  const [preview, paid] = splitPaidContent(html, previewParagraph)
  const freeHTML = preview

  const { key, content, iv, encrypt } = await createEncrypt(paid)

  const encryptedKey = await createEncryptJWT(
    base64ToUint8Array(encryptKey),
    JSON.stringify({ id, plan, key: uint8ArrayToBase64(key) }),
  )
  const paidContent = {
    key: encryptedKey,
    content: uint8ArrayToBase64(content),
    iv: uint8ArrayToBase64(iv),
  }

  const encryptedSegments = await Promise.all(
    segments.map(async (segment, index, source): Promise<Segment> => {
      const html = (segment as NormalSegment).html
      const noEncrypt = html === undefined || (index < previewParagraph && source.length > previewParagraph)
      if (noEncrypt) return segment

      const content = await encrypt(html)
      return {
        id: 'paid',
        type: segment.type,
        paidContent: uint8ArrayToBase64(content),
      }
    }),
  )
  return { freeHTML, paidContent, segments: encryptedSegments }
}
