import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

const base: Options = {
  dts: true,
  clean: true,
  format: ['esm'],
}

export default defineConfig([
  {
    ...base,
    entry: ['src/index.ts'],
    outDir: 'dist/server',
    tsconfig: 'tsconfig.json',
  },
  {
    ...base,
    entry: ['src/index.browser.ts'],
    outDir: 'dist/client',
    tsconfig: 'tsconfig.json',
  },
])
