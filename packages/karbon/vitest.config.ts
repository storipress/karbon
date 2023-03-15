import { defineConfig } from 'vitest/config'
import { resolve } from 'pathe'

export default defineConfig({
  define: {
    'process.dev': true,
  },
  resolve: {
    alias: {
      '#imports': resolve(__dirname, './src/test-helpers/imports.ts'),
      '#build/storipress-urls.mjs': resolve(__dirname, './src/test-helpers/urls.ts'),
    },
  },
  test: {
    include: ['./src/**/*.{spec,test}.ts'],
  },
})
