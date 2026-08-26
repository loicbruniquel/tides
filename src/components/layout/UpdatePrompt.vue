<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

import Button from '@/components/ui/Button.vue'

// `registerType: 'prompt'` in vite.config.ts — the new service worker waits until the
// user accepts, so a reload never interrupts them mid-scrub.
const { needRefresh, updateServiceWorker } = useRegisterSW()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200"
    leave-active-class="transition-all duration-200"
    enter-from-class="translate-y-4 opacity-0"
    leave-to-class="translate-y-4 opacity-0"
  >
    <div
      v-if="needRefresh"
      class="safe-bottom fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg"
    >
      <p class="flex-1 text-sm">A new version is available.</p>
      <Button size="sm" variant="ghost" @click="needRefresh = false">Later</Button>
      <Button size="sm" @click="updateServiceWorker(true)">Reload</Button>
    </div>
  </Transition>
</template>
