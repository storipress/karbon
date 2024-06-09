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

  // eslint-disable-next-line regexp/optimal-quantifier-concatenation
  return text.replace(/<\/?[^>]*>/g, '').trim()
}
