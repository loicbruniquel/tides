import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'public/**'],
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
    // `__APP_VERSION__` is substituted by the `define` in vite.config.ts, so it is
    // never declared in source. TypeScript knows it from src/env.d.ts; eslint needs
    // telling separately or no-undef flags it.
    languageOptions: {
      globals: {
        __APP_VERSION__: 'readonly',
      },
    },
    rules: {
      // Single-word component filenames are fine for views and graph layers.
      'vue/multi-word-component-names': 'off',

      // Pure whitespace opinions inherited from vue/recommended. Satisfying them
      // means one attribute per line, which makes the templates several times
      // taller without making them clearer. Left to the editor.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',

      // Optional props are typed `foo?: T` and read as `undefined`, which is a
      // meaningful value here (e.g. an absent `class`). A default would not help.
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
