import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// 在 ESLint 配置中使用 Node.js 环境变量
const env = process.env.VITE_ENV || 'development'
const isProduction = env === 'production'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': isProduction ? 'error' : 'warn', // 生产环境禁用 console,开发环境警告
      'no-undef': 'error',
      '@typescript-eslint/no-unused-vars': [1],
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
])
