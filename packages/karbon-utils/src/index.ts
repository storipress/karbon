import { decode } from './entities.server'
import { createHTMLFilter } from './html-filter'

export const htmlFilter = createHTMLFilter(decode)

export { filterHTMLTag } from './html-filter'
