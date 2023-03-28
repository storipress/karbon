import type { Resolver } from '@nuxt/kit'
import {
  addComponent,
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  addTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
  installModule,
  resolvePath,
  useNuxt,
} from '@nuxt/kit'
import { encodePath } from 'ufo'
import defu from 'defu'
import { omit } from 'remeda'
import serialize from 'serialize-javascript'
import fs from 'fs-extra'
import { resolve } from 'pathe'
import { genArrayFromRaw, genImport, genObjectFromRaw } from 'knitwork'
import { resolveSEOProviders } from './seo-provider'
import type {
  ArticleMeta,
  DeskMeta,
  ModuleOptions,
  ModulePublicRuntimeConfig,
  ModuleRuntimeConfig,
  PayloadScope,
  ResolvedSEOConfig,
  ResourcePageContext,
  URLGenerators,
  UserSEOConfig,
} from './runtime/types'
import { getResources, payloadScopes } from './runtime/api/sitemap'
import telemetry from './modules/telemetry'
const AD_COMPONENTS = ['AdvertisingProvider', 'AdvertisingSlot', 'GlobalAdvertisingProvider', 'GlobalAdvertisingSlot']

function isUserSEOConfig(config: ResolvedSEOConfig): config is UserSEOConfig {
  return Boolean(config.importName && config.importPath)
}

const stubTrue = () => true
const resources: ModuleOptions['resources'] = {
  article: {
    route: '/posts/:id',
    enable: true,
    getIdentity: ({ id }) => ({ type: 'article', id }),
    isValid: stubTrue,
    toURL: ({ id }: ArticleMeta) => `/posts/${id}`,
  },
  desk: {
    route: '/desks/:id',
    enable: true,
    getIdentity: ({ id }) => ({ type: 'desk', id }),
    isValid: stubTrue,
    toURL: ({ id }: DeskMeta) => `/desks/${id}`,
  },
  tag: {
    route: '/tags/:id',
    enable: true,
    getIdentity: ({ id }) => ({ type: 'tag', id }),
    isValid: stubTrue,
    toURL: ({ id }: DeskMeta) => `/tags/${id}`,
  },
  author: {
    route: '/authors/:id',
    enable: true,
    getIdentity: ({ id }) => ({ type: 'author', id }),
    isValid: stubTrue,
    toURL: ({ id }: DeskMeta) => `/authors/${id}`,
  },
}

const karbon = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@storipress/karbon',
    configKey: 'karbon',
    compatibility: {
      nuxt: '^3.1.0',
    },
  },
  defaults: {
    fullStatic: true,
    resources,
    fallback: {
      layout: undefined as undefined | null | string,
    },
    paywall: {
      enable: true,
      logo: '',
    },
    seo: [
      {
        preset: 'basic',
        options: {
          twitterCard: 'summary_large_image',
        },
      },
    ],
    isViewable: '~~/karbon/is-viewable.mjs',
    previewParagraph: 3,
  },
  async setup({ resources, fullStatic, fallback, paywall, seo, isViewable: isViewablePath, previewParagraph }, nuxt) {
    const resolver = createResolver(import.meta.url)
    const promises: Promise<unknown>[] = []
    const resourcePagePromises: Promise<unknown>[] = []
    const PRE_BUNDLED_PACKAGES = [
      '@algolia/events',
      '@iframely/embed.js',
      'algoliasearch-helper',
      'cross-fetch',
      'typesense-instantsearch-adapter',
      'qs',
    ]

    nuxt.options.experimental.payloadExtraction = true
    nuxt.options.css.push(resolver.resolve('./runtime/assets/article-base.css'))

    nuxt.options.vite.optimizeDeps ??= {}
    nuxt.options.vite.optimizeDeps.include ??= []
    nuxt.options.vite.optimizeDeps.include.push(...PRE_BUNDLED_PACKAGES)

    nuxt.options.alias ??= {}
    nuxt.options.alias['@storipress/sdk'] = resolver.resolve('.')

    nuxt.options.runtimeConfig.storipress = {
      apiDomain: 'https://api.stori.press',
      searchDomain: 'search.stori.press',
      ...nuxt.options.runtimeConfig.storipress,
      fallback,
      fullStatic,
      previewParagraph,
    }

    if (paywall) {
      nuxt.options.runtimeConfig.storipress.paywall = paywall
    }

    nuxt.options.runtimeConfig.public.storipress = {
      ...nuxt.options.runtimeConfig.public.storipress,
      searchDomain: 'search.stori.press',
      ...omit(nuxt.options.runtimeConfig.storipress, ['apiToken', 'stripeKey']),
      fullStatic,
      previewParagraph,
    }

    const runtimeDir = resolver.resolve('./runtime')
    nuxt.options.alias['#karbon'] = runtimeDir
    nuxt.options.build.transpile.push(runtimeDir, '@storipress/vue-advertising')

    // Resource pages
    const RESOURCE = new Set(['article', 'author', 'desk', 'tag'])
    const resourceKeys = Object.keys(resources)
    for (const key of resourceKeys) {
      if (RESOURCE.has(key)) {
        resourcePagePromises.push(addResourcePage(key, resources))
      } else {
        addResourcePage(key, resources, key)
      }
    }

    addRedirectPage()
    await Promise.all(resourcePagePromises)

    // Type declaration for url
    addTemplate({
      filename: 'storipress-urls.mjs.d.ts',
      src: resolver.resolve('./runtime/templates/storipress-urls.mjs.d.ts'),
    })

    // Expose url generating logic to client-side js
    const serializedURLs = `
      ${genImport('ufo', ['normalizeURL', 'cleanDoubleSlashes'])}
      ${genImport('@storipress/karbon/route-helper', ['extractURLParam', 'paramNameToParamKey'])}
      export default ${serialize(resources)}
    `
    addTemplate({
      filename: 'storipress-urls.mjs',
      getContents: () => serializedURLs,
    })

    // Type declaration for seo
    addTemplate({
      filename: 'seo-presets.mjs.d.ts',
      src: resolver.resolve('./runtime/templates/seo-presets.mjs.d.ts'),
    })

    const articleLayouts = `
      ${genImport('remeda', ['mapKeys', 'mapValues', 'pipe'])}
      ${genImport('scule', ['snakeCase'])}
      ${genImport('pathe', ['basename'])}
      export const templates = pipe(
        import.meta.glob('~~/templates/article-layouts/*.vue', { eager: true }),
        mapKeys((name) => snakeCase(basename(name, '.vue'))),
        mapValues((mod) => mod.default)
      )
    `
    addTemplate({
      filename: 'article-layouts.mjs',
      getContents: () => articleLayouts,
    })

    const logoPath = await resolvePath(nuxt.options.runtimeConfig.public.storipress.paywall.logo)
    const addLogo = `${genImport(logoPath, 'paywallLogo')}export default paywallLogo`

    addTemplate({
      filename: 'paywall-logo.mjs',
      getContents: () => addLogo,
    })

    const editorBlocks = `
      ${genImport('remeda', ['mapKeys', 'mapValues', 'pipe'])}
      ${genImport('scule', ['snakeCase'])}
      ${genImport('pathe', ['basename'])}
      export const editorBlocks = pipe(
        import.meta.glob('/templates/editor-blocks/*.vue', { eager: true }),
        mapKeys((name) => snakeCase(basename(name, '.vue'))),
        mapValues((mod) => mod.default)
      )
    `
    addTemplate({
      filename: 'editor-blocks.mjs',
      getContents: () => editorBlocks,
    })

    // Resolve SEO config
    const resolvedSEO = await resolveSEOProviders(seo)
    const seoConfig = `
    ${resolvedSEO
      .filter((x) => isUserSEOConfig(x))
      .map(({ importName, importPath }) => genImport(importPath as string, importName))
      .join('\n')}

      export default ${genArrayFromRaw(
        resolvedSEO.map((config) => {
          if (config.preset) {
            return genObjectFromRaw({
              preset: JSON.stringify(config.preset),
              options: JSON.stringify(config.options),
            })
          } else {
            return genObjectFromRaw({
              presetFactory: config.importName,
              options: JSON.stringify(config.options),
            })
          }
        })
      )}
    `

    addTemplate({
      filename: 'seo-presets.mjs',
      getContents: () => seoConfig,
    })

    const userPath = await resolvePath(isViewablePath)
    nuxt.hook('nitro:config', async (nitroConfig) => {
      nitroConfig.virtual!['#sp-internal/storipress-urls.mjs'] = () => serializedURLs

      nitroConfig.unenv = defu(
        {
          alias: {
            util: '@storipress/karbon/patched-util',
          },
        },
        nitroConfig.unenv
      )

      const resolvedIsViewable = fs.existsSync(userPath)
        ? userPath
        : resolver.resolve('./runtime/app/default-is-viewable.mjs')
      nitroConfig.virtual!['#sp-internal/is-viewable'] = fs.readFileSync(resolvedIsViewable, 'utf-8')

      nitroConfig.rollupConfig ??= {}
      nitroConfig.rollupConfig.plugins ??= []
    })

    // @ts-expect-error nocheck
    nuxt.hook('sitemap:generate', async (ctx) => {
      const options = nuxt.options as Record<string, any>
      if (options.storipress?.fullStatic) return

      const pageResources = await getResources(nuxt.options.runtimeConfig.storipress)

      const invalidContext = { identity: 'invalid', prefix: '', resource: 'invalid' } as unknown as ResourcePageContext

      const urlList: { url: string }[] = payloadScopes
        .map(({ payloadScope, urlKey }) => {
          if (!resources[urlKey].enable) return []

          const resourcesCtx = resources[urlKey]._context ?? invalidContext
          const scopeUrlList = pageResources[payloadScope].map((item: any) => {
            return { url: encodePath(resources[urlKey].toURL(item, resourcesCtx)) }
          })

          return scopeUrlList
        })
        .flat()

      const ctxUrls = ctx.urls as unknown as { url: string }[]
      ctxUrls.push(...urlList)
    })

    // @ts-expect-error nocheck
    nuxt.hook('tailwindcss:config', (tailwindConfig) => {
      const resourcePaths = (srcDir: string) => [
        `${srcDir}/templates/article-layouts/**/*.{vue,js,ts,jsx,tsx}`,
        `${srcDir}/templates/editor-blocks/**/*.{vue,js,ts,jsx,tsx}`,
        `${srcDir}/templates/resources/**/*.{vue,js,ts,jsx,tsx}`,
      ]
      const contentPaths = resourcePaths(nuxt.options.srcDir)
      tailwindConfig.content.push(...contentPaths)
    })

    // Global custom field
    addServerHandler({
      route: `/_storipress/_custom-field.js`,
      handler: await resolver.resolve(`./runtime/routes/custom-field`),
    })
    addServerHandler({
      route: `/_storipress/_custom-field.json`,
      handler: await resolver.resolve(`./runtime/routes/custom-field`),
    })

    addServerHandler({
      route: `/_storipress/_snapshot`,
      handler: await resolver.resolve(`./runtime/routes/_snapshot`),
    })

    if (paywall.enable) {
      addServerHandler({
        route: `/api/decrypt-key`,
        handler: await resolver.resolve(`./runtime/routes/api/decrypt-key`),
      })
    }

    addStaticRoute({ route: '/_storipress/_site', handler: resolver.resolve(`./runtime/routes/meta/site`), fullStatic })

    addStaticRoute({
      route: '/_storipress/_custom-field-group',
      handler: resolver.resolve(`./runtime/routes/custom-field-group`),
      fullStatic,
    })

    // Snapshots
    promises.push(
      addSnapshots(resolver, fullStatic, [
        {
          payloadScope: 'posts',
        },
        {
          payloadScope: 'desks',
        },
        {
          payloadScope: 'tags',
        },
        {
          payloadScope: 'authors',
        },
      ])
    )

    // Auto imports
    for (const component of AD_COMPONENTS) {
      await addComponent({
        name: component,
        export: component,
        filePath: '@storipress/vue-advertising',
      })
    }
    await addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      transpile: true,
    })
    await addComponentsDir({
      path: resolver.resolve('./runtime/article/components'),
      extensions: ['vue'],
      transpile: true,
    })
    addImportsDir([
      resolver.resolve('./runtime/composables'),
      resolver.resolve('./runtime/article/utils'),
      resolver.resolve('./runtime/utils'),
    ])

    addPlugin({
      src: resolver.resolve('./runtime/plugins/storipress-internal'),
    })
    addPlugin({
      src: resolver.resolve('./runtime/plugins/storipress'),
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/storipress-payload'),
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/custom-field'),
    })

    addPlugin({
      src: resolver.resolve(
        paywall.enable && paywall.logo ? './runtime/plugins/paywall.client' : './runtime/plugins/paywall-noop.client'
      ),
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/instant-search.client'),
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/storipress-client'),
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/debug-info.client'),
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/track.client'),
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/iframely.client'),
    })

    await installModule('@nuxt/image-edge', {
      provider: 'Storipress',
      providers: {
        Storipress: {
          provider: resolver.resolve('./runtime/providers/Storipress'),
          options: {},
        },
        unsplash: {
          baseURL: 'https://images.unsplash.com',
          options: {},
        },
      },
    })
    await Promise.all(promises)

    // @ts-expect-error nocheck
    nuxt.options.sitemap = {
      enabled: true,
      trailingSlash: false,
      exclude: ['/_storipress/_snapshot/**'],
    }
    await installModule('nuxt-seo-kit/modules/nuxt-seo-kit/module')
    await installModule('nuxt-simple-robots')
    await installModule('nuxt-simple-sitemap')
    await installModule('nuxt-link-checker')
    await installModule(telemetry)
  },
})

interface AddSnapshotInput {
  payloadScope: PayloadScope
}

async function addStaticRoute({ route, handler, fullStatic }: { route: string; handler: string; fullStatic: boolean }) {
  addServerHandler({
    route: `${route}.js`,
    handler,
  })
  addServerHandler({
    route: `${route}.json`,
    handler,
  })
  if (fullStatic) {
    addPrerenderRoutes([`${route}.js`, `${route}.json`])
  }
}

async function addSnapshots(resolver: Resolver, fullStatic: boolean, configs: AddSnapshotInput[]) {
  addPrerenderRoutes(['/_storipress/_snapshot'])
  await Promise.all(
    configs.map(async ({ payloadScope }) => {
      // add server handler for snapshot resource
      addServerHandler({
        route: `/_storipress/${payloadScope}/:name`,
        handler: await resolver.resolve(`./runtime/routes/${payloadScope}/[name].js`),
      })

      if (fullStatic) {
        // snapshot resources
        addPrerenderRoutes([
          `/_storipress/${payloadScope}/all.js`,
          `/_storipress/${payloadScope}/__all.js`,
          `/_storipress/${payloadScope}/__map.js`,
        ])
      }
    })
  )
}

async function addResourcePage(pageType: keyof URLGenerators, urls: URLGenerators, resourceName?: string) {
  const nuxt = useNuxt()
  const cwd = nuxt.options.rootDir || process.cwd()
  const resource = (resourceName || pageType) as string
  const pagePath = resolve(cwd, `templates/resources/${resource}.vue`)
  if (await fs.pathExists(pagePath)) {
    extendPages((pages) => {
      pages.push({
        file: pagePath,
        path: urls[resource].route,
        name: resource,
        meta: {
          middleware: ['storipress-abort-if-no-meta'],
          ...(resourceName && { resourceName }),
        },
      })
    })
  } else {
    urls[pageType].enable = false
  }
}

function addRedirectPage() {
  const resolver = createResolver(import.meta.url)
  extendPages((pages) => {
    pages.push({
      file: resolver.resolve('./runtime/components/Redirect.vue'),
      path: '/_storipress/redirect',
      name: 'redirect',
      meta: {
        middleware: ['storipress-redirect'],
      },
    })
  })
}

export { ModulePublicRuntimeConfig, ModuleRuntimeConfig, ModuleOptions, karbon as default }
