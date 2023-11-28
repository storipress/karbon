import process from 'node:process'
import { build as viteBuild } from 'vite'
import tailwind from 'tailwindcss'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { snakeCase } from 'scule'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { basename, join } from 'pathe'
import Components from 'unplugin-vue-components/vite'
import virtual from '@rollup/plugin-virtual'
import consola from 'consola'
import { loadNuxtConfig } from '@nuxt/kit'
import { once } from 'remeda'
import type { OutputChunk, OutputOptions } from 'rollup'
import type { BuildOptions } from 'vite'
import invariant from 'tiny-invariant'
import importerChecker from '../plugins/importer-checker'
import { ignoreSet, targetSet } from './setting'

export { bundleLayouts } from './layouts'
export { bundleEditorBlocks } from './editor-blocks'

const loadNuxtConfigOnce = once(() => loadNuxtConfig({}))

export function createConfig(
  name: string,
  dir: string,
  ssr?: boolean,
): BuildOptions['rollupOptions'] & { output: OutputOptions } {
  const config: BuildOptions['rollupOptions'] & { output: OutputOptions } = {
    ...(ssr ? {} : { input: 'entry' }),
    output: {
      dir: join(`.storipress/${dir}/`),
      format: 'commonjs',
      strict: false,
      plugins: [
        {
          name: 'convert-to-iife',
          generateBundle(_opts, bundle) {
            const items = Object.values(bundle)
            const chunks = items.filter((item): item is OutputChunk => item.type === 'chunk')
            invariant(chunks.length === 1, 'Expected exactly one chunk')
            chunks[0].code = `const customBlock = {
              name: '${name}',
              factory: (module, require) => {
              ${chunks[0].code}
              }
            };
            export default customBlock
            `
          },
        },
      ],
    },
    external: [
      'vue',
      '@vueuse/core',
      '@storipress/sdk/article/components',
      '@storipress/sdk/article/utils',
      '@storipress/custom-field',
      '@storipress/vue-advertising',
      '@storipress/sdk/resources',
    ],
  }

  return config
}

export async function bundle(path: string, vuefileName: string, layoutName: string, dir: string, ssr?: boolean) {
  process.env.NODE_ENV = 'production'
  const name = snakeCase(basename(vuefileName, '.vue'))
  const rollupOptions = createConfig(name, dir, ssr)
  const config = await loadNuxtConfigOnce()

  const tailwindConfigPath = `${process.cwd()}/tailwind.config.js`

  await viteBuild({
    clearScreen: false,
    resolve: {
      alias: config.alias,
    },
    build: {
      emptyOutDir: false,
      lib: {
        entry: join(path),
        name: 'block',
        fileName: layoutName,
        formats: ['cjs'],
      },
      rollupOptions,
      ssr,
    },
    css: {
      postcss: {
        plugins: [
          tailwind({
            presets: [
              {
                config: {
                  content: [
                    `${process.cwd()}/templates/article-layouts/*.{vue,ts,tsx}`,
                    `${process.cwd()}/templates/editor-blocks/*.{vue,ts,tsx}`,
                    `${process.cwd()}/templates/components/**/*.{vue,ts,tsx}`,
                  ],
                  corePlugins: {
                    preflight: false,
                  },
                  darkMode: ['class', '.force-use-dark-mode'],
                },
              },
            ],
            config: tailwindConfigPath,
          }),
        ],
      },
    },
    plugins: [
      ...(ssr
        ? []
        : [
            virtual({
              entry: `
                import component from './${join(path)}'
                import './main.css'
                
                export default component
              `,
              'main.css': `@tailwind base;
                @tailwind components;
                @tailwind utilities;
              `,
            }),
          ]),
      tsconfigPaths(),
      cssInjectedByJsPlugin({
        injectCodeFunction: function injectCodeCustomRunTimeFunction(cssCode) {
          try {
            if (typeof document != 'undefined') {
              const elementStyle = document.createElement('style')
              elementStyle.appendChild(document.createTextNode(`${cssCode}`))
              document.head.prepend(elementStyle)
            }
          } catch (e) {
            console.error('vite-plugin-css-injected-by-js', e)
          }
        },
      }),
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        imports: [
          'vue',
          {
            '@storipress/custom-field': ['useField', 'FieldType'],
            '@storipress/sdk/article/utils': ['useArticle', 'useRecommendArticle', 'useSite', 'useColorMode'],
            '@storipress/sdk/resources': ['useResourceResolver'],
          },
        ],
        vueTemplate: true,
        dirs: [`${process.cwd()}/composables`],
        dts: false,
      }),
      vue({}),
      Components({
        extensions: ['vue'],
        include: [/\.vue$/, /\.vue\?vue/],
        dirs: ['components'],
        dts: false,
        resolvers: [
          (componentName) => {
            if (ignoreSet.has(componentName)) return
            if (targetSet.has(componentName)) {
              return { name: componentName, from: '@storipress/sdk/article/components' }
            }
            consola.warn(`Failed to resolve component: ${componentName}`)
          },
        ],
      }),
      importerChecker(),
    ],
    define: { __VUE_PROD_DEVTOOLS__: false },
    publicDir: false,
    logLevel: 'silent',
  })
}
