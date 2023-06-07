import { gql } from '@apollo/client/core/index.js'
import { createStoripressClient } from '../composables/storipress-client'
import { storipressConfigCtx } from '../composables/storipress-base-client'
import type { ModuleRuntimeConfig } from '../types'
import { getAllWithPaginationViaGetPage } from './helper'

const ListArticles = gql`
  query ListArticles($page: Int!) {
    articles(page: $page) {
      paginatorInfo {
        count
        lastPage
        hasMorePages
      }
      data {
        id
        title
        slug
        sid
        published_at
        plan
        cover
        seo
        desk {
          id
          name
          slug
          desk {
            id
            name
            slug
          }
        }
      }
    }
  }
`
const ListDesks = gql`
  query ListDesks {
    desks {
      id
      name
      slug
      desks {
        id
        name
        slug
      }
    }
  }
`
const ListAuthors = gql`
  query ListAuthors {
    users(includeInvitations: false) {
      id
      slug
      email
      first_name
      last_name
      full_name
      avatar
      location
      bio
      website
      socials
      created_at
      updated_at
      desks {
        id
        name
        slug
        seo
        order
      }
    }
  }
`
const ListTags = gql`
  query ListTags {
    tags {
      id
      name
      slug
    }
  }
`

export const payloadScopes = [
  { payloadScope: 'posts', urlKey: 'article', query: ListArticles, queryKey: 'articles' },
  { payloadScope: 'desks', urlKey: 'desk', query: ListDesks, queryKey: 'desks' },
  { payloadScope: 'authors', urlKey: 'author', query: ListAuthors, queryKey: 'users' },
  { payloadScope: 'tags', urlKey: 'tag', query: ListTags, queryKey: 'tags' },
]

export async function getResources(runtimeConfig?: ModuleRuntimeConfig['storipress']) {
  runtimeConfig && storipressConfigCtx.set(runtimeConfig)
  const client = createStoripressClient()

  const result = await Promise.all(
    payloadScopes.map(async ({ payloadScope, query, queryKey }) => {
      let resources: any = []
      switch (payloadScope) {
        case 'posts': {
          const getPage = async (page: number) => {
            const { data } = await client.query({ query, variables: { page } })
            return data.articles
          }
          resources = await getAllWithPaginationViaGetPage(getPage)
          break
        }
        default: {
          const { data } = await client.query({ query })

          resources = data?.[queryKey] ?? []
        }
      }
      return [payloadScope, resources]
    })
  )

  return Object.fromEntries(result)
}
