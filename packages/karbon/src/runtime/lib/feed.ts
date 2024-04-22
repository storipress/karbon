import { Feed } from 'feed'
import { joinURL, withQuery, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'

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

export function addFeedPageLinks(atomXml: string, siteUrl: string, currentPage: number, maxPage: number) {
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
