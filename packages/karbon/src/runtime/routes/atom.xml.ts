import type { H3Event } from 'h3'
import { defineEventHandler, getQuery, setHeader } from 'h3'
import type { FeedArticle } from '@storipress/karbon/internal'
import { addFeedPageLinks, generateAtomFeed, listFeedArticles } from '@storipress/karbon/internal'
import type { _NormalizeArticle } from '../api/normalize-article'
import { useRuntimeConfig } from '#imports'
import urls from '#sp-internal/storipress-urls.mjs'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/xml; charset=UTF-8')
  if (!process.dev) setHeader(event, 'Cache-Control', 'max-age=600, must-revalidate')

  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl as string

  const { currentPageArticles, currentPage, maxPage } = paginateArticle(event, await listFeedArticles())

  const atomXml = generateAtomFeed({
    articles: currentPageArticles,
    siteUrl,
    siteName: runtimeConfig.public.siteName as string,
    siteDescription: runtimeConfig.public.siteDescription as string,
    feedUrl: 'atom.xml',
    getArticleURL: (article) => urls.article.toURL(article, urls.article._context),
  })

  const buildAtomXml = addFeedPageLinks(atomXml, siteUrl, currentPage, maxPage)

  return buildAtomXml
})

const ARTICLES_PER_PAGE = 100

function paginateArticle(event: H3Event, articles: FeedArticle[]) {
  const queryString = getQuery(event)
  const page = Number(queryString.page) || 1
  const maxPage = Math.ceil(articles.length / ARTICLES_PER_PAGE)
  const currentPage = page > maxPage ? maxPage : page
  const currentPageArticles = articles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  return { currentPageArticles, currentPage, maxPage }
}
