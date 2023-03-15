import { gql } from '@apollo/client/core/index.js'
import { useStoripressClient } from '../composables/storipress-client'

export interface GetSiteQuery {
  __typename?: 'Query'
  site: {
    __typename?: 'Site'
    name: string
    timezone: string
    favicon?: string | null
    socials?: any | null
    logo?: {
      __typename?: 'Image'
      token: string
      url: string
      name: string
      mime: string
      size: number
      width: number
      height: number
      title?: string | null
      caption?: string | null
      description?: string | null
      transformation?: any | null
    } | null
    plan: string
  }
}

const getSiteQuery = gql`
  query GetSite {
    site {
      name
      timezone
      favicon
      socials
      logo {
        token
        url
        name
        mime
        size
        width
        height
        title
        caption
        description
        transformation
      }
      plan
    }
  }
`

export async function getSite() {
  const client = useStoripressClient()
  const { data } = await client.query({ query: getSiteQuery })

  return data.site as GetSiteQuery
}
