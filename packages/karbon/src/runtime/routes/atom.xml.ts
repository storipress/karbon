import { defineEventHandler, setHeader } from 'h3'
import { Feed } from 'feed'
import { encodePath, joinURL, withTrailingSlash } from 'ufo'
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
}

export default defineEventHandler(async (e) => {
  setHeader(e, 'Content-Type', 'text/xml; charset=UTF-8')
  if (!process.dev) setHeader(e, 'Cache-Control', 'max-age=600, must-revalidate')

  const runtimeConfig = useRuntimeConfig()
  const articles = await listFeedArticles()

  const siteUrl = runtimeConfig.public.siteUrl
  const feed = new Feed({
    id: withTrailingSlash(runtimeConfig.public.siteUrl),
    link: withTrailingSlash(runtimeConfig.public.siteUrl),
    title: runtimeConfig.public.siteName,
    description: runtimeConfig.public.siteDescription,
    updated: new Date(),
    feedLinks: {
      atom: joinURL(siteUrl, 'atom.xml'),
    },
  })

  articles
    .filter((article: TArticle) => article.published_at)
    .forEach((article: TArticle) => {
      const id = encodePath(urls.article.toURL(article, urls.article._context))
      feed.addItem({
        title: article.title,
        id: joinURL(siteUrl, id),
        link: joinURL(siteUrl, id),
        description: article.plaintext.slice(0, 120),
        date: new Date(article.published_at),
        author: article.author?.map((author) => ({
          name: author.name,
        })) || [{ name: 'Storipress' }],
        content: article.html,
      })
    })

  return feed.atom1()
})
