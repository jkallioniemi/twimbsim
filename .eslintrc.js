module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
  ],
  ignorePatterns: ['node_modules/', 'build/'],
  rules: {
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
  },
}
