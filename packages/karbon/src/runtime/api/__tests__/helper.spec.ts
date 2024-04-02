import { expect, it, vi } from 'vitest'
import type { PaginationData } from '../helper'
import { getAllWithPaginationViaGetPage, getRemainingPages } from '../helper'

it('getRemainingPage', () => {
  expect(getRemainingPages(3)).toEqual([2, 3])
  expect(getRemainingPages(4)).toEqual([2, 3, 4])
  expect(getRemainingPages(1)).toEqual([])
})

it('getAllWithPaginationViaGetPage', async () => {
  const fn = vi.fn(async (page: number): Promise<PaginationData> => {
    if (page === 1) {
      return {
        paginatorInfo: {
          hasMorePages: false,
          lastPage: 1,
        },
        data: [1, 2, 3],
      }
    }

    throw new Error('no more page')
  })
  await expect(getAllWithPaginationViaGetPage(fn)).resolves.toMatchInlineSnapshot(`
    [
      1,
      2,
      3,
    ]
  `)
  expect(fn).toBeCalledTimes(1)
})
