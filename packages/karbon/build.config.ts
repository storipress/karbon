import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/route-helper', './src/helper', './src/internal'],
  failOnWarn: false,
})
