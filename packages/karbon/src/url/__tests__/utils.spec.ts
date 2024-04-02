import { expect, it } from 'vitest'
import { paramNameToParamKey } from '../utils'

it('paramNameToParamKey', () => {
  expect(paramNameToParamKey(':foo')).toBe('foo')
  expect(paramNameToParamKey(':foo?')).toBe('foo')
})
