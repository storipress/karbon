import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addFeedPageLinks, createFeed, generateAtomFeed } from '../feed'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-04-24T00:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createFeed', () => {
  it('can create feed with default config', () => {
    const feed = createFeed({
      siteName: 'site name',
      siteDescription: 'site description',
      siteUrl: 'https://example.com',
      feedUrl: 'atom.xml',
    })

    feed.addItem({
      title: 'title',
      date: new Date('2024-04-24T00:00:00.000Z'),
      link: 'https://example.com/post',
    })

    expect(feed.atom1()).toMatchSnapshot()
  })
})

describe('generateAtomFeed', () => {
  it('can generate atom feed', () => {
    const atom = generateAtomFeed({
      articles: [
        {
          id: '1',
          slug: 'slug',
          authors: [{ name: 'author' }] as any,
          title: 'title',
          html: 'html',
          plaintext: 'plaintext',
          updated_at: '2024-04-24T00:00:00.000Z',
          published_at: '2024-04-24T00:00:00.000Z',
        },
      ],
      getArticleURL: () => '/posts/slug',
      siteName: 'site name',
      siteDescription: 'site description',
      siteUrl: 'https://example.com',
      feedUrl: 'atom.xml',
    })

    expect(atom).toMatchSnapshot()
  })
})

const ATOM_FIXTURE = `
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <id>https://example.com/</id>
    <title>site name</title>
    <updated>2024-04-24T00:00:00.000Z</updated>
    <generator>https://github.com/jpmonette/feed</generator>
    <link rel="alternate" href="https://example.com/"/>
    <link rel="self" href="https://example.com/atom.xml"/>
    <subtitle>site description</subtitle>
    <rights>© site name 2024 All Rights Reserved</rights>
    <entry>
        <title type="html"><![CDATA[title]]></title>
        <id>https://example.com/post</id>
        <link href="https://example.com/post"/>
        <updated>2024-04-24T00:00:00.000Z</updated>
    </entry>
</feed>
`

describe('addFeedPageLinks', () => {
  it('can add feed page links', () => {
    expect(addFeedPageLinks(ATOM_FIXTURE, 'https://example.com', 2, 3)).toMatchSnapshot()
  })
})
