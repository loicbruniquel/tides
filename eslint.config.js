import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'node_modules/**',
      'src/**/*.js',
      'public/**',

      // TEMPORARY: legacy Quasar/Vue 2 components still on disk. Remove these once
      // the legacy tree is deleted — see docs/MIGRATION_PLAN.md.
      'src/pages/**',
      'src/layouts/**',
      'src/components/DateControl.vue',
      'src/components/user/**',
      'src/components/tides/Graph/**',
      'src/components/stations/Form.vue',
      'src/components/stations/List.vue',
      'src/components/stations/map/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      // Single-word component filenames are fine for views and graph layers.
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
