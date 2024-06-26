import antfu from '@antfu/eslint-config'
import prettier from 'eslint-plugin-prettier'

export default antfu(
  {
    stylistic: false,
    vue: true,
    plugins: { prettier },
    rules: {
      'node/prefer-global/process': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',

      'prettier/prettier': 'error',
    },
  },
  {
    files: ['packages/playground/**/*.vue', 'packages/playground/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: ['**/dist/**', 'packages/karbon/bin/**', '**/*.md', '**/*.toml', '.moon/templates/**'],
  },
)
