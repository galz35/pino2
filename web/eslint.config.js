import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'no-empty': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-useless-catch': 'off'
    },
  },
])
