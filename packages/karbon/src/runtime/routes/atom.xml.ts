import { defineEventHandler, setHeader } from 'h3'
import { Feed } from 'feed'
import { encodePath } from 'ufo'
import { useRuntimeConfig } from '#imports'
import urls from '#sp-internal/storipress-urls.mjs'
import { listFeedArticles } from '@storipress/karbon/internal'

export default defineEventHandler(async (e) => {
  setHeader(e, 'Content-Type', 'text/xml; charset=UTF-8')
  if (!process.dev) setHeader(e, 'Cache-Control', 'max-age=600, must-revalidate')

  const runtimeConfig = useRuntimeConfig()
  const articles = await listFeedArticles()

  const feed = new Feed({
    id: runtimeConfig.public.siteUrl,
    link: runtimeConfig.public.siteUrl,
    title: runtimeConfig.public.siteName,
    description: runtimeConfig.public.siteDescription,
    updated: new Date(),
    feedLinks: {
      atom: `${runtimeConfig.public.siteUrl}/atom.xml`,
    },
  })

  articles.forEach(article => {
    const id = encodePath(urls.article.toURL(article, urls.article._context))
    feed.addItem({
      title: article.title,
      id,
      link: `${runtimeConfig.public.siteUrl}${id}`,
      description: article.slug,
      date: new Date(article.published_at),
      author: article.author,
      content: article.html,
    })
  })

  return feed.atom1()
})
