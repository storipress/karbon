import { parseFragment, serialize } from 'parse5'

const PREVIEW_PARAGRAPH = 3

export function splitPaidContent(source: string, previewParagraph = PREVIEW_PARAGRAPH): [string, string] {
  if (!source) {
    return ['', '']
  }

  const fragment = parseFragment(source)

  if (fragment.childNodes.length > previewParagraph) {
    return [
      serialize({
        ...fragment,
        childNodes: fragment.childNodes.slice(0, previewParagraph),
      }),
      serialize({
        ...fragment,
        childNodes: fragment.childNodes.slice(previewParagraph),
      }),
    ]
  }

  return ['', source]
}
