import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  typescript: true,
  react: true,
  rules: {
    'no-unused-vars': 'warn',
    'ts/no-unused-vars': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    'no-console': 'error',
    'no-undef': 'error',
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
  },
  ignores: ['src/components/ui/*'],
})
