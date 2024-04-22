import { defineEventHandler, sendNoContent, setHeader } from 'h3'
import path from 'pathe'
import { generateAtomFeed, getDeskWithSlug, listArticles } from '@storipress/karbon/internal'
import { useRuntimeConfig } from '#imports'
import urls from '#sp-internal/storipress-urls.mjs'

export default defineEventHandler(async (e) => {
  setHeader(e, 'Content-Type', 'text/xml; charset=UTF-8')
  if (!process.dev) setHeader(e, 'Cache-Control', 'max-age=600, must-revalidate')

  const fileName = e.context.params?.slug ?? ''
  if (!fileName.endsWith('.xml')) {
    return sendNoContent(e, 404)
  }

  const slug = path.parse(fileName).name
  const desk = await getDeskWithSlug(slug)
  if (!desk?.id) {
    return sendNoContent(e, 404)
  }

  const subDesks: string[] = desk.desks?.map(({ id }: { id: string }) => id) ?? []

  const runtimeConfig = useRuntimeConfig()
  const articles = await listArticles({ desk_ids: [desk.id, ...subDesks] })

  const siteUrl = runtimeConfig.public.siteUrl as string

  const atomXml = generateAtomFeed({
    articles,
    siteUrl,
    siteName: runtimeConfig.public.siteName as string,
    siteDescription: runtimeConfig.public.siteDescription as string,
    feedUrl: `/atom/${fileName}`,
    getArticleURL: (article) => urls.article.toURL(article, urls.article._context),
  })
  return atomXml
})
