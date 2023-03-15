import type { DocumentNode } from 'graphql'
import { flatten } from 'remeda'
import invariant from 'tiny-invariant'
import { useStoripressClient } from '../composables/storipress-client'

export interface PaginationData {
  paginatorInfo: {
    lastPage: number
    hasMorePages: boolean
  }
  data: any[]
}

export async function getAllWithPagination(
  document: DocumentNode,
  variables: any = {},
  getPaginationData: (data: any) => PaginationData
) {
  const client = useStoripressClient()
  const getPage = async (page: number): Promise<PaginationData> => {
    const res = await client.query({ query: document, variables: { ...variables, page } })
    const data = getPaginationData(res.data)
    return data
  }
  return getAllWithPaginationViaGetPage(getPage)
}

export async function getAllWithPaginationViaGetPage(
  getPage: (page: number) => Promise<PaginationData>
): Promise<any[]> {
  const firstPage = await getPage(1)
  const firstData = firstPage.data

  const remaining = await Promise.all(
    getRemainingPages(firstPage.paginatorInfo.lastPage).map(async (page) => {
      const pageData = await getPage(page)
      return pageData.data
    })
  )

  return flatten([firstData, ...remaining])
}

export function getRemainingPages(lastPage: number) {
  invariant(lastPage > 0)
  if (lastPage === 1) {
    return []
  }
  return Array.from({ length: lastPage - 1 }).map((_, index) => index + 2)
}
