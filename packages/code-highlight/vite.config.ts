import { defineConfig } from 'vite'
import Babel from 'vite-plugin-babel'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'code-highlight.css',
      },
    },
  },
  plugins: [
    Babel({
      filter: /\.(js|jsx|ts|tsx)$/,
    }),
  ],
})
