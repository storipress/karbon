import { expect, it, vi } from 'vitest'
import { normalizeArticle } from '../normalize-article'
import { mockQueryArticle, mockTypesenseArticle } from './article.mock'

vi.mock('#imports', async () => await vi.importActual('../../../normalize-helper'))

it('mockTypesenseArticle', () => {
  expect(normalizeArticle(mockTypesenseArticle)).toMatchSnapshot()
  expect(normalizeArticle(mockQueryArticle)).toMatchSnapshot()
})
