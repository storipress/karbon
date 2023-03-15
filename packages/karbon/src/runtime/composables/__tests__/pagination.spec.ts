import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { usePagination } from '../pagination'

test('usePagination with remaining page', () => {
  const res = usePagination(ref([1, 2, 3]), 2)
  expect(res.page.value).toBe(1)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(true)
  expect(res.hasPreviousPage.value).toBe(false)

  // next page
  res.nextPage()
  expect(res.page.value).toBe(2)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(false)
  expect(res.hasPreviousPage.value).toBe(true)
  expect(res.list.value).toEqual([3])

  // no more next page
  res.nextPage()
  expect(res.page.value).toBe(2)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(false)
  expect(res.hasPreviousPage.value).toBe(true)

  // previous page
  res.previousPage()
  expect(res.page.value).toBe(1)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(true)
  expect(res.hasPreviousPage.value).toBe(false)
  expect(res.list.value).toEqual([1, 2])

  // no more previous page
  res.previousPage()
  expect(res.page.value).toBe(1)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(true)
  expect(res.hasPreviousPage.value).toBe(false)
  expect(res.list.value).toEqual([1, 2])

  res.page.value = 3
  expect(res.page.value).toBe(2)
})

test('usePagination with exactly page', () => {
  const res = usePagination(ref([1, 2, 3, 4]), 2)
  expect(res.page.value).toBe(1)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(true)
  expect(res.hasPreviousPage.value).toBe(false)

  // next page
  res.nextPage()
  expect(res.page.value).toBe(2)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(false)
  expect(res.hasPreviousPage.value).toBe(true)
  expect(res.list.value).toEqual([3, 4])

  // no more next page
  res.nextPage()
  expect(res.page.value).toBe(2)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(false)
  expect(res.hasPreviousPage.value).toBe(true)

  // previous page
  res.previousPage()
  expect(res.page.value).toBe(1)
  expect(res.total.value).toBe(2)
  expect(res.hasNextPage.value).toBe(true)
  expect(res.hasPreviousPage.value).toBe(false)
  expect(res.list.value).toEqual([1, 2])

  res.page.value = 3
  expect(res.page.value).toBe(2)
})

test('usePagination with empty list', () => {
  const res = usePagination(ref([]), 2)
  expect(res.page.value).toBe(0)
  expect(res.total.value).toBe(0)
  expect(res.hasNextPage.value).toBe(false)
  expect(res.hasPreviousPage.value).toBe(false)
  expect(res.list.value).toEqual([])
})

describe('preconditon validation', () => {
  let warn: Mock
  beforeEach(() => {
    warn = vi.fn()
    vi.stubGlobal('console', {
      warn,
    })
  })

  afterEach(() => {
    expect(warn).toBeCalled()
    vi.restoreAllMocks()
  })

  test('usePagination throw when limit is 0', () => {
    expect(() => {
      usePagination(ref([]), 0)
    }).toThrowErrorMatchingInlineSnapshot('"Invariant failed: `limit` must not be negative or 0"')
  })

  test('usePagination throw when limit is < 0', () => {
    expect(() => {
      usePagination(ref([]), -1)
    }).toThrowErrorMatchingInlineSnapshot('"Invariant failed: `limit` must not be negative or 0"')

    expect(() => {
      usePagination(ref([]), -2)
    }).toThrowErrorMatchingInlineSnapshot('"Invariant failed: `limit` must not be negative or 0"')
  })
})
