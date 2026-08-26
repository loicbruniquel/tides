import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { readJson, readString, writeJson, writeString } from '@/lib/storage'

export type Theme = 'system' | 'light' | 'dark'

/** Read as a raw string by the pre-paint script in index.html — keep both in sync. */
const THEME_KEY = 'tides.theme'
const SETTINGS_KEY = 'tides.settings'

export const MIN_PREFETCH_DAYS = 1
export const MAX_PREFETCH_DAYS = 14
const DEFAULT_PREFETCH_DAYS = 5

interface PersistedSettings {
  prefetchDays: number
}

function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useSettingsStore = defineStore('settings', () => {
  const stored = readString(THEME_KEY)
  const theme = ref<Theme>(isTheme(stored) ? stored : 'system')

  const persisted = readJson<PersistedSettings>(SETTINGS_KEY, {
    prefetchDays: DEFAULT_PREFETCH_DAYS,
  })
  const prefetchDays = ref(
    Math.min(
      MAX_PREFETCH_DAYS,
      Math.max(MIN_PREFETCH_DAYS, Math.round(persisted.prefetchDays) || DEFAULT_PREFETCH_DAYS),
    ),
  )

  function applyTheme() {
    const dark = theme.value === 'dark' || (theme.value === 'system' && prefersDark())
    document.documentElement.classList.toggle('dark', dark)
  }

  watch(
    theme,
    (value) => {
      writeString(THEME_KEY, value)
      applyTheme()
    },
    { immediate: true },
  )

  watch(prefetchDays, (value) => writeJson(SETTINGS_KEY, { prefetchDays: value }))

  // Follow the OS while the user has not made an explicit choice.
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', () => {
    if (theme.value === 'system') applyTheme()
  })

  return { theme, prefetchDays }
})
