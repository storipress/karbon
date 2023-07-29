import { v4 as uuidv4 } from 'uuid'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import findCacheDirectory from 'find-cache-dir'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import type { ResourcePage } from './runtime/types'

export enum EventName {
  deployStart = 'karbon_deploy_start',
  deploySuccess = 'karbon_deploy_success',
  deployFail = 'karbon_deploy_fail',
  project = 'karbon_project',
  command = 'karbon_command',
}

interface TemplateAmount {
  articleLayout: number
  editorBlock: number
}

interface TRoute {
  resource: string
  params: string[]
}

type JsonValue =
  | string
  | number
  | boolean
  | undefined
  | (string | number | boolean | Record<string, JsonValue>)[]
  | { [key: string]: JsonValue }

async function sendTrack(event: EventName, properties?: Record<string, JsonValue>) {
  const anonymousId = await getAnonymousId()
  const client = await createRudderAnalytics()

  client.track({
    anonymousId,
    event,
    properties,
  })
}

export async function track(event: EventName, amount?: TemplateAmount) {
  return sendTrack(
    event,
    event !== EventName.deployStart
      ? {
          article_layout_amount: amount?.articleLayout,
          editor_block_amount: amount?.editorBlock,
        }
      : undefined,
  )
}

export async function trackProject(options: any) {
  const resources: Record<string, ResourcePage<{ id: string }, unknown>> = options?.karbon?.resources
  const route: TRoute[] = []
  if (resources) {
    Object.keys(resources).forEach((resource) => {
      if (!resources[resource].enable) {
        return
      }
      const matches = resources[resource].route.match(/:[\w_]+/g)
      route.push({
        resource,
        params: Array.from(matches || []),
      })
    })
  }

  return sendTrack(EventName.project, {
    ...Object.fromEntries(route.map((r) => [r.resource, r.params])),
    usedRoutes: route.map((r) => r.resource),
    isSSR: options.mode === 'universal' || options.ssr === true,
    target: options._generate ? 'static' : 'server',
  })
}

export async function trackCommand() {
  const command = process.argv[2] || 'unknown'

  return sendTrack(EventName.command, {
    command,
  })
}

export async function initTrack(environment: string) {
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
    environment,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })
}

let cachedAnonymousId: string | undefined
async function getAnonymousId(): Promise<string> {
  if (cachedAnonymousId) {
    return cachedAnonymousId
  }

  const thunk = findCacheDirectory({ name: 'storipress', thunk: true })
  const cachePath = thunk && thunk('cli-cache')
  const storage = createStorage({
    driver: fsDriver({ base: cachePath }),
  })

  const hasCache = cachePath && (await storage.hasItem(cachePath))
  if (!cachePath) {
    cachedAnonymousId = uuidv4()
    return cachedAnonymousId as string
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
  cachedAnonymousId = anonymousId as string
  return anonymousId as string
}

function createRudderAnalytics() {
  return {
    identify: (_: { anonymousId: string }) => {},
    group: (_: { anonymousId: string; groupId: string }) => {},
    track: (_: { anonymousId: string; event: EventName; properties?: Record<string, JsonValue> }) => {},
  }
}
