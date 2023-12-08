import { SearchClient } from 'typesense'
import axios from 'axios'
import * as adapter from '@haverstack/axios-fetch-adapter'
import { getStoripressConfig } from './storipress-base-client'

let typesenseClient: SearchClient

export function useTypesenseClient() {
  if (typesenseClient) return typesenseClient

  axios.defaults.adapter = getAdapter()
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
  desk_ids?: string[]
  author_ids?: string[]
  author_names?: string[]
  tag_ids?: string[]
  tag_names?: string[]
}

export const PER_PAGE = 100

// PropertiesList: 'headline', 'title', 'blurb', 'desk', 'deskUrl', 'url', 'authors', 'time'
// headline: article.cover?.url
// deskUrl: article.desk && `/desks/${getDesk(article.desk).slug}`
// url: slug
// time: new Date(article.published_at)
export const propertiesToKeep = [
  'featured',
  'order',
  'slug',
  'updated_at',
  'id',
  'plan',
  'bio',
  'published_at',
  'title',
  'blurb',
  'seo',
  'plaintext',
  'cover',
  'authors',
  'desk',
  'tags',
  'pathnames',
] as const

export function getSearchQuery(page = 1, filter: TypesenseFilter = {}) {
  const { desk_ids, author_ids, author_names, tag_ids, tag_names } = filter
  let filterBy = 'published:=true'
  if (desk_ids?.length) filterBy += ` && desk_id:=[${desk_ids.join()}]`
  if (author_ids?.length) filterBy += ` && author_ids:=[${author_ids.join()}]`
  if (author_names?.length) filterBy += ` && author_names:=[${author_names.join()}]`
  if (tag_ids?.length) filterBy += ` && tag_ids:=[${tag_ids.join()}]`
  if (tag_names?.length) filterBy += ` && tag_names:=[${tag_names.join()}]`

  return {
    q: '*',
    sort_by: 'published_at:desc,order:asc',
    filter_by: filterBy,
    per_page: PER_PAGE,
    page,
    query_by: 'title',
    include_fields: propertiesToKeep.join(','),
  }
}

// workaround for package issue
function getAdapter() {
  const createFetchAdapter = (adapter.default as any).createFetchAdapter
  if (typeof createFetchAdapter === 'function') {
    return createFetchAdapter()
  }

  return adapter.createFetchAdapter()
}
