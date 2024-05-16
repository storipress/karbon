import { expect, it } from 'vitest'
import { identity, reduce } from 'remeda'
import type { SEOContext } from '../seo-preset'
import { resolveSEOPresets } from '../seo-preset'
import type { BaseMeta, ResourcePage } from '../../types'

it('can handle article', () => {
  const handlers = resolveSEOPresets([{ preset: 'basic' }])
  const results: unknown[] = []
  const resourceURL: ResourcePage<BaseMeta> = {
    enable: true,
    isValid: () => true,
    getIdentity: () => ({ type: 'article', id: '1' }),
    toURL: () => '',
    route: '',
  }
  const context: SEOContext = {
    metaType: 'article',
    runtimeConfig: {} as any,
    site: {
      name: 'site_name',
    },
    articleFilter: identity,
    useHead: (input: unknown) => void results.push(input),
    useSeoMeta: (input: unknown) => void results.push(input),
    resourceUrls: {
      article: {
        ...resourceURL,
        toURL: () => 'article_url',
      },
      desk: {
        ...resourceURL,
        toURL: () => 'desk_url',
      },
      author: {
        ...resourceURL,
        toURL: () => 'author_url',
      },
      tag: {
        ...resourceURL,
        toURL: () => 'tag_url',
      },
    },
  }

  const article = {
    title: 'title',
    blurb: 'blurb',
    bio: 'author_bio',
    cover: {
      url: 'cover_url',
    },
    author: {
      name: 'author_name',
    },
  }

  for (const handler of handlers) {
    handler(article, context)
  }

  expect(reduce(results, (acc, cur) => Object.assign(acc, cur), {})).toMatchSnapshot()
})

const ARTICLE_FIXTURE = {
  __typename: 'Article',
  slug: 'article_slug',
  featured: false,
  layout: null,
  shadow_authors: null,
  metafields: [],
  relevances: [
    {
      __typename: 'Article',
      id: '2',
      title: '<p>Another Article</p>',
    },
  ],
  content_blocks: [],
  bio: 'My bio',
  bioHTML: '<p>My bio</p>',
  published_at: '2024-01-01T00:00:00+00:00',
  updated_at: '2024-01-01T00:00:00+00:00',
  title: '<p>title</p>',
  blurb: '<p>blurb</p>',
  seo: {
    og: {
      title: 'og_title',
      description: 'og_description',
    },
    meta: {
      title: 'meta_title',
      description: 'meta_description',
    },
    hasSlug: true,
    ogImage: '',
  },
  plaintext: 'Hello world',
  cover: {
    alt: 'cover alt',
    url: 'https://example.com/cover.png',
    crop: {
      key: '123',
      top: 50,
      left: 50,
      zoom: 1,
      width: 0,
      height: 0,
      realWidth: 1600,
      realHeight: 915,
    },
    caption: '',
  },
  authors: [
    {
      __typename: 'User',
      bio: '<p>My bio</p>',
      slug: 'author_slug',
      avatar: 'https://example.com/profile.png',
      email: 'author@example.com',
      location: 'Earth',
      first_name: 'Author',
      last_name: 'Name',
      full_name: 'Author Name',
      id: '1',
      socials: {
        LinkedIn: 'www.example.com',
      },
      name: 'Author Name',
    },
  ],
  desk: {
    __typename: 'Desk',
    id: '5',
    name: 'Desk',
    slug: 'desk',
    layout: null,
    desk: null,
  },
  tags: [],
  id: '1',
  plan: 'free',
  html: '<p>Hello world</p>',
  segments: [
    {
      id: 'normal',
      type: 'p',
      html: '<p>Hello world</p>',
    },
  ],
  __sp_cf: {},
  __sp_cf_editor_block: {},
}

it('can handle real article', () => {
  const handlers = resolveSEOPresets([{ preset: 'basic' }])
  const results: unknown[] = []
  const resourceURL: ResourcePage<BaseMeta> = {
    enable: true,
    isValid: () => true,
    getIdentity: () => ({ type: 'article', id: '1' }),
    toURL: () => '',
    route: '',
  }
  const context: SEOContext = {
    metaType: 'article',
    runtimeConfig: {} as any,
    site: {
      name: 'site_name',
    },
    articleFilter: identity,
    useHead: (input: unknown) => void results.push(input),
    useSeoMeta: (input: unknown) => void results.push(input),
    resourceUrls: {
      article: {
        ...resourceURL,
        toURL: () => 'article_url',
      },
      desk: {
        ...resourceURL,
        toURL: () => 'desk_url',
      },
      author: {
        ...resourceURL,
        toURL: () => 'author_url',
      },
      tag: {
        ...resourceURL,
        toURL: () => 'tag_url',
      },
    },
  }

  for (const handler of handlers) {
    handler(ARTICLE_FIXTURE, context)
  }

  expect(reduce(results, (acc, cur) => Object.assign(acc, cur), {})).toMatchSnapshot()
})

const USER_FIXTURE = {
  __typename: 'User',
  id: '16',
  slug: 'user_slug',
  email: 'user@example.com',
  first_name: 'User',
  last_name: 'Name',
  full_name: 'User Name',
  avatar: 'https://example.com/profile.png',
  location: 'Earth',
  bio: '<p>Hello world</p>',
  website: 'example.com',
  socials: {
    Twitter: 'twitter.example.com',
    Facebook: 'fb.example.com',
    LinkedIn: 'linkedin.example.com',
    YouTube: 'www.youtube.com/example',
    Pinterest: 'www.example.com/a',
  },
  created_at: '2024-01-01T00:00:00+00:00',
  updated_at: '2024-01-01T00:00:00+00:00',
  desks: [],
  name: 'User Name',
  __sp_cf: {},
  __sp_cf_editor_block: {},
}

it('can handle author page', () => {
  const handlers = resolveSEOPresets([{ preset: 'basic' }])
  const results: unknown[] = []
  const resourceURL: ResourcePage<BaseMeta> = {
    enable: true,
    isValid: () => true,
    getIdentity: () => ({ type: 'article', id: '1' }),
    toURL: () => '',
    route: '',
  }
  const context: SEOContext = {
    metaType: 'author',
    runtimeConfig: {} as any,
    site: {
      name: 'site_name',
    },
    articleFilter: identity,
    useHead: (input: unknown) => void results.push(input),
    useSeoMeta: (input: unknown) => void results.push(input),
    resourceUrls: {
      article: {
        ...resourceURL,
        toURL: () => 'article_url',
      },
      desk: {
        ...resourceURL,
        toURL: () => 'desk_url',
      },
      author: {
        ...resourceURL,
        toURL: () => 'author_url',
      },
      tag: {
        ...resourceURL,
        toURL: () => 'tag_url',
      },
    },
  }

  for (const handler of handlers) {
    handler(USER_FIXTURE, context)
  }

  expect(reduce(results, (acc, cur) => Object.assign(acc, cur), {})).toMatchSnapshot()
})
