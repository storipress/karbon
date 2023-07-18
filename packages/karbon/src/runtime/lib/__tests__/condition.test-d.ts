import { assertType, test } from 'vitest'
import type { ConditionInput } from '../article-filter'

test('ConditionInput', () => {
  assertType<ConditionInput>({ type: 'featured' })
  assertType<ConditionInput>({ key: 'slug', value: 'foo' })
  assertType<ConditionInput>({ type: 'desk', key: 'id', value: 'foo' })
  assertType<ConditionInput>({ type: 'tag', key: 'id', value: 'foo' })
  assertType<ConditionInput>({ type: 'author', key: 'id', value: 'foo' })
})
