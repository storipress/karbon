import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import builtin from 'builtin-modules'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      axios: path.join(__dirname, './src/xior.ts'),
    },
  },
  build: {
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: builtin as string[],
    },
  },
})
