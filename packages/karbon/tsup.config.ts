import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/cli/enter.ts'],
  target: 'node18',
  format: 'esm',
  esbuildOptions(options) {
    options.allowOverwrite = true
    return options
  },
  noExternal: [/@apollo\/client/],
  platform: 'node',
  banner: {
    // ESBuild can't rewrite require to esm
    // Ref: https://github.com/evanw/esbuild/issues/1921
    // TODO try remove this when this merge https://github.com/evanw/esbuild/pull/2067
    js: `
import { createRequire as _createRequire } from 'module';
const require = _createRequire(import.meta.url);
${process.env.POLYFILL_CRYPTO ? "globalThis.crypto = require('crypto').webcrypto;" : ''}`,
  },
})
