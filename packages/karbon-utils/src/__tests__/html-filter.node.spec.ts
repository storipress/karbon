import { expect, it } from 'vitest'
import { decode } from '../entities.server'
import { createHTMLFilter } from '../html-filter'

const htmlFilter = createHTMLFilter(decode)

it('can remove html tag', () => {
  expect(htmlFilter('<div>hello</div>')).toBe('hello')
})

it('can convert entities encoded string', () => {
  expect(htmlFilter('<div>hello&#39;world</div>')).toBe("hello'world")
})
