import { v4 as uuidv4 } from 'uuid'
import RudderAnalytics from '@rudderstack/rudder-sdk-node'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import findCacheDirectory from 'find-cache-dir'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'

export enum EventName {
  deployStart = 'custom_site_deploy_start',
  deploySuccess = 'custom_site_deploy_success',
  deployFail = 'custom_site_deploy_fail',
}

interface TemplateAmount {
  articleLayout: number
  editorBlock: number
}

export async function track(event: EventName, amount?: TemplateAmount) {
  const anonymousId = await getAnonymousId()
  const client = await createRudderAnalytics()

  client.track({
    anonymousId,
    event,
    ...(event !== EventName.deployStart && {
      properties: {
        article_layout_amount: amount?.articleLayout,
        editor_block_amount: amount?.editorBlock,
      },
    }),
  })
}

export async function initTrack() {
  const anonymousId = await getAnonymousId()
  const client = await createRudderAnalytics()
  const { loadNuxtConfig } = await import('@nuxt/kit')
  const {
    runtimeConfig: { storipress },
  } = await loadNuxtConfig({})

  client.identify({
    anonymousId,
  })
  if (storipress?.clientId) {
    client.group({
      anonymousId,
      groupId: storipress.clientId,
    })
  }

  Sentry.init({
    dsn: 'https://2f13ed3db07d46f38d41e31e4c90eaa8@o930441.ingest.sentry.io/4504468016201728',

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })
}

async function getAnonymousId() {
  const thunk = findCacheDirectory({ name: 'storipress', thunk: true })
  const cachePath = thunk && thunk('cli-cache')
  const storage = createStorage({
    driver: fsDriver({ base: cachePath }),
  })

  const hasCache = cachePath && (await storage.hasItem(cachePath))
  if (!cachePath) {
    return
  }
  if (!hasCache) {
    await storage.setItem(cachePath, uuidv4())
  }
  const hasId = await storage.getItem(cachePath)
  // prevent user keep the file but empty the content
  if (!hasId) {
    await storage.setItem(cachePath, uuidv4())
  }

  const anonymousId = await storage.getItem(cachePath)
  return anonymousId as string
}

function createRudderAnalytics() {
  const client = new RudderAnalytics('2K2KXtd4cfXGGt8pm5aBP2GlCvl', {
    dataPlaneUrl: 'https://storipresspmvx.dataplane.rudderstack.com',
  })

  return client
}
