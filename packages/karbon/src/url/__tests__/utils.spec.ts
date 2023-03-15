import { expect, test } from 'vitest'
import { paramNameToParamKey } from '../utils'

test('paramNameToParamKey', () => {
  expect(paramNameToParamKey(':foo')).toBe('foo')
  expect(paramNameToParamKey(':foo?')).toBe('foo')
})
