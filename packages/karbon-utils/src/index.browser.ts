import { decode } from './entities.client'
import { createHTMLFilter } from './html-filter'

export const htmlFilter = createHTMLFilter(decode)

export * from './shared'
