// @ts-expect-error virtual file
import { templates } from '#build/article-layouts.mjs'
import { useRuntimeConfig } from '#imports'

export function getDefaultLayout() {
  const {
    public: { storipress },
  } = useRuntimeConfig()
  return storipress.fallback.layout || Object.keys(templates)[0]
}
