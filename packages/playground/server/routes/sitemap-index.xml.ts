export default defineEventHandler((event) => {
  return sendProxy(event, '/sitemap_index.xml', { fetch: $fetch.raw })
})
