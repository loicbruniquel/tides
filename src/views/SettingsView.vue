<script setup lang="ts">
import { ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import { clearTideCache } from '@/lib/query'
import { MAX_PREFETCH_DAYS, MIN_PREFETCH_DAYS, useSettingsStore, type Theme } from '@/stores/settings'

const settings = useSettingsStore()

const THEMES: Array<{ value: Theme; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const cleared = ref(false)

async function clearCache() {
  await clearTideCache()
  cleared.value = true
  window.setTimeout(() => (cleared.value = false), 2500)
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-16">
    <section class="rounded-2xl border border-border bg-card p-4">
      <h2 class="font-semibold">Theme</h2>
      <div class="mt-3 flex gap-2">
        <Button
          v-for="option in THEMES"
          :key="option.value"
          :variant="settings.theme === option.value ? 'default' : 'outline'"
          size="sm"
          @click="settings.theme = option.value"
        >
          {{ option.label }}
        </Button>
      </div>
    </section>

    <section class="rounded-2xl border border-border bg-card p-4">
      <h2 class="font-semibold">Offline days</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        How many days to download and keep when you open a station.
      </p>

      <div class="mt-3 flex items-center gap-3">
        <input
          v-model.number="settings.prefetchDays"
          type="range"
          :min="MIN_PREFETCH_DAYS"
          :max="MAX_PREFETCH_DAYS"
          class="flex-1 accent-[var(--primary)]"
        />
        <span class="w-16 text-right text-sm tabular-nums">
          {{ settings.prefetchDays }} day{{ settings.prefetchDays === 1 ? '' : 's' }}
        </span>
      </div>
    </section>

    <section class="rounded-2xl border border-border bg-card p-4">
      <h2 class="font-semibold">Cached data</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Predictions are stored on this device so the app works offline. Clearing them
        frees space; they will be downloaded again when you next have a connection.
      </p>
      <Button variant="outline" size="sm" class="mt-3" @click="clearCache">
        {{ cleared ? 'Cleared' : 'Clear cached tides' }}
      </Button>
    </section>
  </div>
</template>
