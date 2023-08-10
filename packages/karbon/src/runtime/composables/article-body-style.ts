import type { MaybeElementRef } from '@vueuse/core'
import { useElementBounding, useElementSize } from '@vueuse/core'
import { computed, markRaw } from 'vue'

export function useArticleBodyStyle(root: MaybeElementRef) {
  const { left } = useElementBounding(root)
  // mark document.body as raw to prevent third-party libraries from modifying it
  const { width } = useElementSize(() => (typeof window !== 'undefined' ? markRaw(document.body) : null))

  const bodyWidth = computed(() => (width.value ? '100vw' : `${width}px`))
  return computed(() => ({ '--left-offset': `${left.value ?? 0}px`, '--body-width': bodyWidth.value }))
}
