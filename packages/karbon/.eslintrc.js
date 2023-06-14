module.exports = {
  extends: ['@antfu/vue', 'prettier', 'prettier/prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'antfu/if-newline': 'off',
  },
}
