import { decryptJWT, uint8ArrayToBase64 } from '@storipress/karbon-utils'
import { describe, expect, it } from 'vitest'
import { html } from 'proper-tags'
import { encryptArticle } from '../encrypt-article'
import { ArticlePlan } from '../../types'
import { splitArticle } from '../../lib/split-article'

const HTML_FIXTURE = html`
  <div>free paragraph 1</div>
  <div>free paragraph 2</div>
  <div>paid paragraph 1</div>
  <div>paid paragraph 2</div>
  <div>paid paragraph 3</div>
`

describe('encryptArticle', () => {
  it('should encrypt article', async () => {
    const key = new Uint8Array(32).fill(0)
    const encryptKey = uint8ArrayToBase64(key)

    const article = await encryptArticle({
      id: '1',
      encryptKey,
      html: HTML_FIXTURE,
      plan: ArticlePlan.Member,
      segments: splitArticle(HTML_FIXTURE),
    })

    expect(article.freeHTML).toBe(
      html`
        <div>free paragraph 1</div>
        <div>free paragraph 2</div>
      `.trim(),
    )

    const meta = JSON.parse(await decryptJWT(key, article.paidContent.key))
    expect(meta.id).toBe('1')
    expect(meta.plan).toBe(ArticlePlan.Member)
    expect(typeof meta.key).toBe('string')
    expect(article.segments).toBeInstanceOf(Array)
  })
})
