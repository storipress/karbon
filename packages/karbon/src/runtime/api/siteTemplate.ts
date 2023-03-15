import { gql } from '@apollo/client/core/index.js'
import invariant from 'tiny-invariant'
import fetch from 'node-fetch-native'
import { createStoripressBaseClient } from '../composables/storipress-base-client'

export enum TemplateType {
  ArticleLayout = 'articleLayout',
  BuilderBlock = 'builderBlock',
  EditorBlock = 'editorBlock',
  EditorBlockSsr = 'editorBlockSsr',
  Site = 'site',
}

const RequestPresignedUploadURL = gql`
  mutation RequestPresignedUploadURL {
    requestPresignedUploadURL {
      url
      key
      signature
    }
  }
`

const UploadSiteTemplate = gql`
  mutation UploadSiteTemplate($input: UploadSiteTemplateInput!) {
    uploadSiteTemplate(input: $input) {
      key
      type
      url
      name
      description
    }
  }
`
export async function requestPresignedUploadURL(buffer: Buffer) {
  const client = await createStoripressClient()
  const presignedURLResponse = await client.mutate({ mutation: RequestPresignedUploadURL })

  invariant(presignedURLResponse?.data, 'cannot create presigned url')
  const { key, url: uploadURL } = presignedURLResponse.data.requestPresignedUploadURL
  await fetch(uploadURL, {
    method: 'PUT',
    body: buffer,
    headers: {
      'Content-Type': 'application/zip',
    },
  })

  return key
}

export async function uploadSiteTemplate(key: string) {
  const client = await createStoripressClient()
  const { data } = await client.mutate({ mutation: UploadSiteTemplate, variables: { input: { key } } })

  return data.uploadSiteTemplate
}

async function createStoripressClient() {
  const { loadNuxtConfig } = await import('@nuxt/kit')
  const {
    runtimeConfig: { storipress },
  } = await loadNuxtConfig({})

  return createStoripressBaseClient(
    () => ({
      authorization: `Bearer ${storipress?.apiToken}`,
    }),
    `${storipress?.apiHost}/client/${storipress?.clientId}/graphql`
  )
}
