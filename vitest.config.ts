import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      exclude: ['packages/playground', '.yarn/**/*', 'packages/*/public', 'packages/karbon/bin'],
    },
  },
})
