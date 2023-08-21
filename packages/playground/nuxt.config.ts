// https://v3.nuxtjs.org/api/configuration/nuxt.config
import {
  createArticleRoute,
  createAuthorRoute,
  createDeskRoute,
  createResourceRoute,
  createTagCollectionRoute,
  createTagRoute,
} from '@storipress/karbon/helper'

export default defineNuxtConfig({
  devtools: {
    enabled: true,

    experimental: {
      timeline: true,
    },

    timeline: {
      enabled: true,
    },
  },
  modules: ['@storipress/karbon', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],
  build: {
    transpile: ['@storipress/vue-advertising'],
  },
  routeRules: {
    '/posts/*': { swr: true },
  },
  runtimeConfig: {
    storipress: {
      apiHost: process.env.NUXT_KARBON_API_HOST,
      apiToken: process.env.NUXT_KARBON_API_TOKEN,
      clientId: process.env.NUXT_KARBON_CLIENT_ID,
      stripeKey: process.env.NUXT_KARBON_STRIPE_KEY,
      searchKey: process.env.NUXT_KARBON_SEARCH_KEY,
      searchDomain: process.env.NUXT_KARBON_SEARCH_DOMAIN,
      encryptKey: process.env.NUXT_KARBON_ENCRYPT_KEY,
    },
    public: {
      trailingSlash: Boolean(process.env.NUXT_PUBLIC_TRAILING_SLASH) || false,
      titleSeparator: process.env.NUXT_PUBLIC_TITLE_SEPARATOR || '|',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Karbon',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000/',
      siteDescription: process.env.NUXT_PUBLIC_SITE_URL || 'My publication',
      language: process.env.NUXT_PUBLIC_LANGUAGE || 'en',
    },
  },

  karbon: {
    flags: {
      lazySearch: true,
    },
    fullStatic: false,
    seo: [
      {
        preset: 'basic',
        options: {
          twitterCard: 'summary_large_image',
        },
      },
      {
        provider: './karbon/seo/example.ts',
      },
    ],
    resources: {
      article: createArticleRoute('/posts/{id}', { meta: { foo: 'bar' } }),
      desk: createDeskRoute('/desks/{id}'),
      author: createAuthorRoute('/author/{id}'),
      tag: createTagRoute('/tags/{id}'),
      collection: createTagCollectionRoute('/collection/{slug}', 'taggroup'),
      collectionTwo: createResourceRoute({
        resource: 'tag',
        groupKey: 'taggroup',
        url: '/collection-2/{id}',
      }),
    },
    paywall: {
      logo: './image/favicon.png',
    },
  },
})
