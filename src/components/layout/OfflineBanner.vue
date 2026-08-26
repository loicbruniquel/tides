<script setup lang="ts">
import { PhCloudSlash } from '@phosphor-icons/vue'

import { useOnline } from '@/composables/useOnline'

const online = useOnline()
</script>

<template>
  <!-- Clips the slide-in so the banner never rides up into the status-bar inset that
       the chrome wrapper in App.vue reserves. -->
  <div class="overflow-hidden">
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="!online"
        role="status"
        class="flex items-center justify-center gap-2 bg-muted px-4 py-1.5 text-xs text-muted-foreground"
      >
        <PhCloudSlash />
        Offline — showing saved predictions
      </div>
    </Transition>
  </div>
</template>
