import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  rollup: {
    inlineDependencies: true,
    resolve: {
      browser: true,
    },
    commonjs: {
      exclude: [/\.d\.ts$/],
    },
  },
  hooks: {
    'build:before': (ctx) => {
      ctx.options.externals = ctx.options.externals.filter((x) => x !== 'jose')
    },
  },
  declaration: false,
})
