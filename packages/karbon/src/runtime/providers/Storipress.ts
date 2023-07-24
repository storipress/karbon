import { joinURL } from 'ufo'
import type { ProviderGetImage } from '@nuxt/image'
import { createOperationsGenerator } from '#image'

const operationsGenerator = createOperationsGenerator({
  joinWith: '&',
  formatter: (key: string, value: number | string) => `${key}=${value}`,
})

export const getImage: ProviderGetImage = (src, { modifiers = {} } = {}) => {
  const operations = operationsGenerator(modifiers)
  const filenameAndQueries = src + (operations ? `?${operations}` : '')

  return {
    url: joinURL(filenameAndQueries),
  }
}
