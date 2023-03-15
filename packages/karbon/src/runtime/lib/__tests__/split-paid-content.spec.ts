import { expect, test } from 'vitest'
import { splitPaidContent } from '../split-paid-content'

test('splitPaidContent should extract first 3 paragraph by default', () => {
  const [preview, paid] = splitPaidContent('<p>foo</p><p>bar</p><p>baz</p><p>paid</p>')
  expect(preview).not.toContain('paid')
  expect(preview).toMatchInlineSnapshot('"<p>foo</p><p>bar</p><p>baz</p>"')
  expect(paid).toMatchInlineSnapshot('"<p>paid</p>"')

  const [preview2, paid2] = splitPaidContent('<p>foo</p><p>bar</p><p>baz</p><p>paid</p><p>paid2</p>')
  expect(preview2).not.toContain('paid')
  expect(preview2).toMatchInlineSnapshot('"<p>foo</p><p>bar</p><p>baz</p>"')
  expect(paid2).toMatchInlineSnapshot('"<p>paid</p><p>paid2</p>"')
})

test('splitPaidContent should make every thing paid if length not enough', () => {
  const [preview, paid] = splitPaidContent('<p>paid</p>')
  expect(preview).not.toContain('paid')
  expect(preview).toMatchInlineSnapshot('""')
  expect(paid).toMatchInlineSnapshot('"<p>paid</p>"')
})
