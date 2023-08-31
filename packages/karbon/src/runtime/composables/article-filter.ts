import { useNuxtApp } from '#imports'

export function useArticleFilter() {
  const { $entities } = useNuxtApp()

  return (html: string): string => {
    if (!html) {
      return ''
    }
    return $entities.decode(filterHTMLTag(html))
  }
}

export function filterHTMLTag(text: string) {
  if (!text) {
    return ''
  }

  return text.replace(/<\/?[^>]*>/g, '').trim()
}
