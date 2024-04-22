import type { H3Event } from 'h3'
import { defineEventHandler, getQuery, setHeader } from 'h3'
import type { RuntimeConfig } from '@nuxt/schema'
import { encodePath, joinURL } from 'ufo'
import { addFeedPageLinks, createFeed, listFeedArticles } from '@storipress/karbon/internal'
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
  authors: Author[]
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

const ARTICLES_PER_PAGE = 100

async function generateAtomFeed(runtimeConfig: RuntimeConfig, event: H3Event) {
  const articles = await listFeedArticles()

  const siteUrl = runtimeConfig.public.siteUrl as string
  const feed = createFeed({
    siteUrl,
    siteName: runtimeConfig.public.siteName as string,
    siteDescription: runtimeConfig.public.siteDescription as string,
    feedUrl: 'atom.xml',
  })

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
          article.authors?.map((author) => ({
            name: author.name,
          })) || [],
        content: article.html,
      })
    })

  const atomXml = feed.atom1()

  const buildAtomXml = addFeedPageLinks(atomXml, siteUrl, currentPage, maxPage)
  return buildAtomXml
}
