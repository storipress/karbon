import type { H3Event } from 'h3'
import { defineEventHandler, getQuery, setHeader } from 'h3'
import { Feed } from 'feed'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import type { RuntimeConfig } from '@nuxt/schema'
import { encodePath, joinURL, withQuery, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { listFeedArticles } from '@storipress/karbon/internal'
import type { Author } from '../composables/page-meta'
import { useRuntimeConfig } from '#imports'
import urls from '#sp-internal/storipress-urls.mjs'

interface TArticle {
  title: string
  id: string
  link: string
  description: string
  content: string
  date: Date
  author: Author[]
  plaintext: string
  html: string
  published_at: string
  updated_at: string
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/xml; charset=UTF-8')
  if (!process.dev) setHeader(event, 'Cache-Control', 'max-age=600, must-revalidate')

  const runtimeConfig = useRuntimeConfig()
  return await generateAtomFeed(runtimeConfig, event)
})
async function generateAtomFeed(runtimeConfig: RuntimeConfig, event: H3Event) {
  const articles = await listFeedArticles()

  const siteUrl = runtimeConfig.public.siteUrl as string
  const feed = new Feed({
    id: withTrailingSlash(siteUrl),
    link: withTrailingSlash(siteUrl),
    title: runtimeConfig.public.siteName as string,
    description: runtimeConfig.public.siteDescription as string,
    updated: new Date(),
    feedLinks: {
      atom: joinURL(siteUrl, 'atom.xml'),
    },
    copyright: `© ${runtimeConfig.public.siteName} ${new Date().getFullYear()} All Rights Reserved`,
  })

  const ARTICLES_PER_PAGE = Number(process.env.NUXT_KARBON_RSS_PAGE_COUNT) || 100
  const queryString = getQuery(event)
  const page = Number(queryString.page) || 1
  const maxPage = Math.ceil(articles.length / ARTICLES_PER_PAGE)
  const currentPage = page > maxPage ? maxPage : page
  const currentPageArticles = articles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  currentPageArticles
    .filter((article: TArticle) => article.published_at)
    .forEach((article: TArticle) => {
      const id = encodePath(urls.article.toURL(article, urls.article._context))
      feed.addItem({
        title: article.title,
        id: joinURL(siteUrl, id),
        link: joinURL(siteUrl, id),
        description: article.plaintext.slice(0, 120),
        date: new Date(article.updated_at),
        published: new Date(article.published_at),
        author:
          article.author?.map((author) => ({
            name: author.name,
          })) || [],
        content: article.html,
      })
    })

  const atomXml = feed.atom1()

  const buildAtomXml = addPageLinks(atomXml, siteUrl, currentPage, maxPage)
  return buildAtomXml
}

function addPageLinks(atomXml: string, siteUrl: string, currentPage: number, maxPage: number) {
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
