export default cachedEventHandler(
  async (e) => {
    // const [
    //   posts,
    //   pages,
    //   products
    // ] = await Promise.all([
    //   $fetch('/api/posts'),
    //   $fetch('/api/pages'),
    //   $fetch('/api/products')
    // ])
    return [{ loc: 'https://play.com/play' }]
  },
  {
    name: 'sitemap-dynamic-urls',
    maxAge: 60 * 10, // cache URLs for 10 minutes
  }
)
