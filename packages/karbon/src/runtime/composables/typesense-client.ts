import { SearchClient } from 'typesense'
import { getStoripressConfig } from './storipress-base-client'

let typesenseClient: SearchClient

export function useTypesenseClient() {
  if (typesenseClient) return typesenseClient

  const storipress = getStoripressConfig()
  typesenseClient = new SearchClient({
    nodes: [
      {
        host: storipress.searchDomain ?? '',
        port: 443,
        protocol: 'https',
      },
    ],
    apiKey: storipress.searchKey,
    connectionTimeoutSeconds: 5,
  })
  return typesenseClient
}

export interface TypesenseFilter {
  desk?: string
  tag?: string
  author?: string
  desk_ids?: string[]
}

export const PER_PAGE = 100

export function getSearchQuery(page = 1, filter: TypesenseFilter = {}) {
  const { desk, tag, author, desk_ids: deskIds } = filter
  let filterBy = ''
  if (desk) filterBy += ` && (desk.id:= ${desk} || desk.desk.id:= ${desk})`
  if (tag) filterBy += ` && tag_ids:=${tag}`
  if (author) filterBy += ` && author_ids:${author}`
  if (deskIds) filterBy += ` && desk_id:[${deskIds.join()}`

  return {
    q: '*',
    sort_by: 'published_at:desc,order:asc',
    filter_by: `published:=true${filterBy}`,
    per_page: PER_PAGE,
    page,
    preset: `list-articles-${page}`,
  }
}
