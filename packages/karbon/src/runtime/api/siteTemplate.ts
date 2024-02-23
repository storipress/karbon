import type { Buffer } from 'node:buffer'
import { gql } from '@apollo/client/core/index.js'
import invariant from 'tiny-invariant'
import fetch from 'node-fetch-native'
import consola from 'consola'
import type { ZodError } from 'zod'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client/core/index.js'
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

const apollo = {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
}
async function createStoripressClient() {
  const { loadNuxtConfig } = await import('@nuxt/kit')
  const {
    runtimeConfig: { storipress },
  } = await loadNuxtConfig({})
  const { apiHost, apiToken, clientId } = assertConfig(storipress)

  return createStoripressBaseClient(
    apollo,
    () => ({
      authorization: `Bearer ${apiToken}`,
    }),
    `${apiHost}/client/${clientId}/graphql`,
  )
}

const configSchema = z.object({
  apiToken: z.string(),
  apiHost: z
    .string()
    .default('https://api.stori.press')
    .transform((value) => value.replace(/\/$/, '')),
  clientId: z.string(),
})

function assertConfig(config: unknown) {
  try {
    const result = configSchema.parse(config)

    return result
  } catch (error) {
    consola.error("Cannot found valid 'storipress' config in nuxt.config.js. Please ensure it's configured correctly.")
    consola.error(fromZodError(error as ZodError))
    process.exit(1)
  }
}
