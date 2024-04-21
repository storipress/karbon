export function createHTMLFilter(decode: (s: string) => string) {
  return (html: string): string => {
    if (!html) {
      return ''
    }
    return decode(filterHTMLTag(html))
  }
}

export function filterHTMLTag(text: string) {
  if (!text) {
    return ''
  }

  return text.replace(/<\/?[^>]*>/g, '').trim()
}
