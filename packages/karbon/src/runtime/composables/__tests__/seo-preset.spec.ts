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
    useHead: (input) => void results.push(input),
    useSeoMeta: (input) => void results.push(input),
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
