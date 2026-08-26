import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// Deliberately separate from vite.config.ts so the PWA plugin (which emits a service
// worker and a manifest) never runs during unit tests.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
})
