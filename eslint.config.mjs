import nextPlugin from 'eslint-config-next'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'
import promisePlugin from 'eslint-plugin-promise'

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '.env',
      '.env.*',
      '*.log',
      'public/**',
      '.git/**',
      'dist/**',
    ],
  },
  ...nextPlugin,
  {
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      promise: promisePlugin,
    },
    rules: {
      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Promise rules
      'promise/always-return': 'warn',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'warn',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/no-new-statics': 'error',
    },
  },
]

export default eslintConfig
