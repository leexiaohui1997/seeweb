module.exports = {
  root: false,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: ['../../.eslintrc.cjs'],
  rules: {
    // 可以在这里覆盖或添加特定规则
  },
  ignorePatterns: ['dist', 'node_modules'],
}
