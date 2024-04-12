import path from 'node:path'
import url from 'node:url'
import { defineBuildConfig } from 'unbuild'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default defineBuildConfig({
  entries: ['./src/route-helper', './src/helper', './src/internal'],
  failOnWarn: false,
  alias: {
    '#imports': path.resolve(__dirname, './src/normalize-helper.ts'),
  },
})
