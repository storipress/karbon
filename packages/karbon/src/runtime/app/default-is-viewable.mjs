import { defineIsViewable } from '@storipress/karbon/helper'
import { createStoripressBaseClient, createTenantURL } from '@storipress/karbon/internal'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable, gql } from '@apollo/client/core/index.js'
import { useRuntimeConfig } from '#imports'

const apollo = {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
}

const SubscriberProfileQuery = gql`
  query SubscriberProfile {
    subscriberProfile {
      id
      subscribed
    }
  }
`

export default defineIsViewable(async ({ meta, auth }) => {
  if (!auth.token) {
    return {
      pass: false,
      message: 'Missing token',
    }
  }

  const { storipress } = useRuntimeConfig()

  const client = createStoripressBaseClient(
    apollo,
    () => ({
      authorization: `Bearer ${auth.token}`,
    }),
    createTenantURL(storipress),
    { name: 'subscriber' },
  )
  let profile

  try {
    const { data } = await client.query({
      query: SubscriberProfileQuery,
    })
    profile = data?.subscriberProfile
  } catch {
    return {
      pass: false,
      message: 'Invalid token',
    }
  }
  if (!profile) {
    return {
      pass: false,
      message: 'Auth fail',
    }
  }
  if (profile.subscribed) {
    return {
      pass: true,
    }
  }
  if (meta.plan === 'member') {
    return {
      pass: true,
    }
  }
  return { pass: false, message: 'Need subscribed' }
})
