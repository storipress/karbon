import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: false,
  vue: true,
  rules: {
    'node/prefer-global/process': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
  },
})
