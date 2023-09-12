import { decodeHTML } from 'entities'

export function useArticleFilter() {
  return (html: string) => {
    if (!html) {
      return ''
    }
    return decodeHTML(filterHTMLTag(html))
  }
}

export function filterHTMLTag(text: string) {
  if (!text) {
    return ''
  }

  return text.replace(/<\/?[^>]*>/g, '').trim()
}
