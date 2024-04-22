import { Feed } from 'feed'
import { encodePath, joinURL, withQuery, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import type { _NormalizeArticle } from '../api/normalize-article'

export function createFeed({
  siteUrl,
  siteName,
  siteDescription,
  feedUrl,
}: {
  siteUrl: string
  siteName: string
  siteDescription: string
  feedUrl: string
}) {
  return new Feed({
    id: withTrailingSlash(siteUrl),
    link: withTrailingSlash(siteUrl),
    title: siteName,
    description: siteDescription,
    updated: new Date(),
    feedLinks: {
      atom: joinURL(siteUrl, feedUrl),
    },
    copyright: `© ${siteName} ${new Date().getFullYear()} All Rights Reserved`,
  })
}

export function addFeedPageLinks(atomXml: string, siteUrl: string, currentPage: number, maxPage: number): string {
  const option = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    format: true,
  }
  const parser = new XMLParser(option)
  const builder = new XMLBuilder(option)

  const atomJson = parser.parse(atomXml)

  const rssUrl = `${withoutTrailingSlash(siteUrl)}/atom.xml`
  const previousLink =
    currentPage > 1 ? [{ '@_rel': 'previous', '@_href': withQuery(rssUrl, { page: currentPage - 1 }) }] : []
  const nextLink =
    currentPage < maxPage ? [{ '@_rel': 'next', '@_href': withQuery(rssUrl, { page: currentPage + 1 }) }] : []

  const buildAtomXml = builder.build({
    ...atomJson,
    feed: {
      ...atomJson.feed,
      link: [...atomJson.feed.link, ...previousLink, ...nextLink],
    },
  })
  return buildAtomXml
}

export type FeedArticle = Pick<
  _NormalizeArticle,
  'id' | 'slug' | 'plaintext' | 'authors' | 'updated_at' | 'published_at' | 'title' | 'html'
>

export interface GenerateAtomFeedInput {
  articles: FeedArticle[]
  siteUrl: string
  siteName: string
  siteDescription: string
  feedUrl: string
  getArticleURL: (article: FeedArticle) => string
}

export function generateAtomFeed({
  articles,
  siteUrl,
  siteName,
  siteDescription,
  feedUrl,
  getArticleURL,
}: GenerateAtomFeedInput): string {
  const feed = createFeed({
    siteUrl,
    siteName,
    siteDescription,
    feedUrl,
  })

  articles
    .filter((article) => article.published_at)
    .forEach((article) => {
      const id = encodePath(getArticleURL(article))
      feed.addItem({
        title: article.title,
        id: joinURL(siteUrl, id),
        link: joinURL(siteUrl, id),
        description: article.plaintext.slice(0, 120),
        date: new Date(article.updated_at),
        published: new Date(article.published_at),
        author:
          article.authors?.map((author) => ({
            name: author.name,
          })) || [],
        content: article.html,
      })
    })

  return feed.atom1()
}
