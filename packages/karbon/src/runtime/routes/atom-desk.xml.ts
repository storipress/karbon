import { defineEventHandler, sendNoContent, setHeader } from 'h3'
import { Feed } from 'feed'
import { encodePath, joinURL } from 'ufo'
import path from 'pathe'
import { getDeskWithSlug, listFeedArticles } from '@storipress/karbon/internal'
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

  const fileName = e.context.params?.slug || ''
  if (!fileName.endsWith('.xml')) {
    return sendNoContent(e, 404)
  }

  const slug = path.parse(fileName || '').name
  const desk = await getDeskWithSlug(slug)
  if (!desk?.id) {
    return sendNoContent(e, 404)
  }

  const deskIds: string[] = desk.desks?.map(({ id }: { id: string }) => id) ?? []

  type Filter = Record<'desk' | 'desk_ids', string | string[]>
  const filter = {} as Filter
  if (deskIds.length !== 0) {
    filter.desk_ids = deskIds
  } else {
    filter.desk = desk.id
  }

  const runtimeConfig = useRuntimeConfig()
  const articles = await listFeedArticles(filter)

  const siteUrl = runtimeConfig.public.siteUrl
  const feed = new Feed({
    id: runtimeConfig.public.siteUrl,
    link: runtimeConfig.public.siteUrl,
    title: runtimeConfig.public.siteName,
    description: runtimeConfig.public.siteDescription,
    updated: new Date(),
    feedLinks: {
      atom: joinURL(siteUrl, `/atom/${fileName}`),
    },
    copyright: `© ${runtimeConfig.public.siteName} ${new Date().getFullYear()} All Rights Reserved`,
  })

  articles.forEach((article: TArticle) => {
    const id = encodePath(urls.article.toURL(article, urls.article._context))
    feed.addItem({
      title: article.title,
      id,
      link: joinURL(siteUrl, id),
      description: article.plaintext.slice(0, 120),
      date: new Date(article.published_at),
      author: article.author,
      content: article.html,
    })
  })

  return feed.atom1()
})
