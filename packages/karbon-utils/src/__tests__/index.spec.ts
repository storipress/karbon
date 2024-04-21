import { expect, it } from 'vitest'
import * as browserBuild from '../index.browser'
import * as nodeBuild from '../index'

it('have sample exports', () => {
  expect(Object.keys(browserBuild).length).toBeGreaterThan(0)
  expect(Object.keys(browserBuild)).toEqual(Object.keys(nodeBuild))
})
