import { assertType, it } from 'vitest'
import type { ConditionInput } from '../article-filter'

it('conditionInput', () => {
  assertType<ConditionInput>({ type: 'featured' })
  assertType<ConditionInput>({ key: 'slug', value: 'foo' })
  assertType<ConditionInput>({ type: 'desk', key: 'id', value: 'foo' })
  assertType<ConditionInput>({ type: 'tag', key: 'id', value: 'foo' })
  assertType<ConditionInput>({ type: 'author', key: 'id', value: 'foo' })
})
