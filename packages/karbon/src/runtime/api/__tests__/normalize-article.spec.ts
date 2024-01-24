import { expect, test, vi } from 'vitest'
import { normalizeArticle } from '../normalize-article'
import { mockQueryArticle, mockTypesenseArticle } from './article.mock'

vi.mock('#imports', async () => await vi.importActual('../../../normalize-helper'))

test('mockTypesenseArticle', () => {
  expect(normalizeArticle(mockTypesenseArticle)).toMatchSnapshot()
  expect(normalizeArticle(mockQueryArticle)).toMatchSnapshot()
})
