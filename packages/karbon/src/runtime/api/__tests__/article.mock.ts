import type { ArticlePlan } from '../../types'

export const mockTypesenseArticle = {
  authors: [
    {
      avatar: 'https://assets.stori.press/media/images/f3354bcf-a572-4fc0-8e3d-d19cbcfbc318.png',
      bio: '<p>Sid Test</p>',
      full_name: 'Sidd Chang',
      id: 242,
      location: 'T',
      slug: 'sidd-chang',
      socials: '[]',
    },
  ],
  blurb: 'This is a mock article',
  cover:
    '{"url":"https:\\/\\/images.unsplash.com\\/photo-1704461539031-e7c2145e5fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyMzc2NzF8MHwxfGFsbHw5fHx8fHx8Mnx8MTcwNDc1ODc2Nnw&ixlib=rb-4.0.3&q=80&w=1080","alt":null,"caption":"<p>Photo by <a href=\\"https:\\/\\/unsplash.com\\/@kz29?utm_source=Storipress&utm_medium=referral&utm_campaign=api-credit?utm_source=storipress&utm_medium=referral&utm_campaign=api-credit\\">Keith Zhang<\\/a> \\/ <a href=\\"https:\\/\\/unsplash.com\\/?utm_source=storipress&utm_medium=referral&utm_campaign=api-credit\\">Unsplash<\\/a><\\/p>","crop":{"left":50,"top":50,"zoom":1,"width":0,"height":0,"realWidth":4032,"realHeight":3024,"key":""}}',
  desk: { id: 119, name: 'test', slug: 'test-32' },
  featured: false,
  id: '619',
  order: 400,
  pathnames: [
    '/posts/mock-article',
    '/posts/mock-article',
    '/posts/mock-article',
    '/posts/new-mock-article',
    '/posts/mock-article',
  ],
  plan: 'free' as ArticlePlan,
  published_at: 1704757593,
  seo: '{"meta":{"title":"SEO Title Tag: Essential Tips for Effective Article Writing Article Writing","description":"Discover expert tips for boosting your website\'s visibility and driving traffic with our comprehensive SEO strategies guide. strategies guide."},"og":{"title":"","description":""},"ogImage":"","hasSlug":true}',
  slug: 'mock-article-test',
  tags: [{ id: 44, name: 'foo', slug: 'foo' }],
  title: 'Mock Article',
  updated_at: 1704758778,
}

export const mockQueryArticle = {
  id: '619',
  blurb: '<p>This is a mock article</p>',
  published_at: '2024-01-08T23:46:33+00:00',
  updated_at: '2024-01-09T00:32:10+00:00',
  desk: {
    id: '119',
    name: 'test',
    slug: 'test-32',
    layout: null,
    desk: null,
  },
  slug: 'mock-article-test',
  title: '<p>Mock Article</p>',
  featured: false,
  cover:
    '{"url":"https:\\/\\/images.unsplash.com\\/photo-1704461539031-e7c2145e5fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyMzc2NzF8MHwxfGFsbHw5fHx8fHx8Mnx8MTcwNDc1ODc2Nnw&ixlib=rb-4.0.3&q=80&w=1080","alt":null,"caption":"<p>Photo by <a href=\\"https:\\/\\/unsplash.com\\/@kz29?utm_source=Storipress&utm_medium=referral&utm_campaign=api-credit?utm_source=storipress&utm_medium=referral&utm_campaign=api-credit\\">Keith Zhang<\\/a> \\/ <a href=\\"https:\\/\\/unsplash.com\\/?utm_source=storipress&utm_medium=referral&utm_campaign=api-credit\\">Unsplash<\\/a><\\/p>","crop":{"left":50,"top":50,"zoom":1,"width":0,"height":0,"realWidth":4032,"realHeight":3024,"key":""}}',
  seo: '{"meta":{"title":"SEO Title Tag: Essential Tips for Effective Article Writing Article Writing","description":"Discover expert tips for boosting your website\'s visibility and driving traffic with our comprehensive SEO strategies guide. strategies guide."},"og":{"title":"","description":""},"ogImage":"","hasSlug":true}',
  html: '<p>Mock Article Content</p>',
  plaintext: 'Mock Article Content',
  layout: null,
  tags: [
    {
      id: '44',
      slug: 'foo',
      name: 'foo',
    },
  ],
  authors: [
    {
      id: '242',
      bio: '<p>Sid Test</p>',
      slug: 'sidd-chang',
      socials: '[]',
      avatar: 'https://assets.stori.press/media/images/f3354bcf-a572-4fc0-8e3d-d19cbcfbc318.png',
      email: 'sid+0705@storipress.com',
      location: 'T',
      first_name: 'Sidd',
      last_name: 'Chang',
      full_name: 'Sidd Chang',
    },
  ],
  shadow_authors: null,
  plan: 'free' as ArticlePlan,
  metafields: [
    {
      id: '76',
      key: 'layoutid',
      type: 'text',
      values: [],
      group: {
        id: '70',
        key: '__layoutmeta',
        type: 'articleMetafield',
      },
    },
    {
      id: '100',
      key: 'test',
      type: 'text',
      values: [],
      group: {
        id: '81',
        key: 'test',
        type: 'articleMetafield',
      },
    },
    {
      id: '104',
      key: 'color',
      type: 'color',
      values: [],
      group: {
        id: '82',
        key: 'webflow',
        type: 'articleMetafield',
      },
    },
    {
      id: '103',
      key: 'thumbnail-image',
      type: 'file',
      values: [],
      group: {
        id: '82',
        key: 'webflow',
        type: 'articleMetafield',
      },
    },
  ],
  relevances: [
    {
      id: '21',
      title: 'When an editor thinks an article is',
    },
    {
      id: '20',
      title: 'When a writer wants an editor to review their work, it goes here',
    },
    {
      id: '24',
      title:
        "Chris' First Article Chris' First ArticleChris' First ArticleChris' First ArticleChris' First ArticleChris' First Article",
    },
    {
      id: '43',
      title: '<p>&lt;c&gt;12345&lt;/c&gt;</p>',
    },
    {
      id: '596',
      title: '<p>New Article 2</p>',
    },
    {
      id: '597',
      title: '<p>New article 3</p>',
    },
    {
      id: '598',
      title: '<p>New article 4</p>',
    },
  ],
  content_blocks: [],
}
