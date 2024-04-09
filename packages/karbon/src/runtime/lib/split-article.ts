import { parseFragment, serializeOuter } from 'parse5'

export interface NormalSegment {
  id: 'normal'
  type: string
  html: string
}

export interface AdSegment {
  id: string
  type: 'ad'
  props: Record<string, any>
}

export interface PaidSegment {
  id: 'paid'
  type: string
  paidContent: string
}

export type Segment = NormalSegment | AdSegment | PaidSegment

export function splitArticle(source: string): Segment[] {
  if (!source) {
    return []
  }

  const fragment = parseFragment(source)
  const segments = fragment.childNodes.map((_segment) => {
    const segment = _segment
    const DATA_FORMAT = 'data-format'
    const format: { name: string; value: string } | undefined = (segment as any).attrs?.find(
      ({ name }: { name: string }) => name === DATA_FORMAT,
    )
    const type = format?.value || (segment as any).tagName

    return { id: 'normal' as const, type: type || 'div', html: serializeOuter(segment) }
  })

  return segments
}
