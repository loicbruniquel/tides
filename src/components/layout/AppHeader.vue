<script setup lang="ts">
import { PhArrowLeft, PhGearSix } from '@phosphor-icons/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import Button from '@/components/ui/Button.vue'

const route = useRoute()

const isHome = computed(() => route.name === 'stations')
const title = computed(() => (isHome.value ? 'Tides' : (route.meta.title as string) || 'Tides'))

// Injected from package.json at build time, so bumping the version there is the only
// edit needed. Shown only beside the app name — appending it to 'Settings' would read
// as a version of that screen.
const version = __APP_VERSION__
const showVersion = computed(() => title.value === 'Tides')
</script>

<template>
  <!-- Stickiness, backdrop and the safe-area inset belong to the chrome wrapper in
       App.vue, which also holds the offline banner. -->
  <header>
    <div class="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
      <Button
        v-if="!isHome"
        variant="outline"
        size="icon"
        aria-label="Back to stations"
        :as="RouterLink"
        to="/"
      >
        <PhArrowLeft />
      </Button>

      <h1 class="flex min-w-0 flex-1 items-baseline gap-1.5 text-lg font-semibold">
        <span class="truncate">{{ title }}</span>
        <span
          v-if="showVersion"
          class="shrink-0 text-xs font-normal tabular-nums text-muted-foreground"
        >{{ version }}</span>
      </h1>

      <Button
        v-if="route.name !== 'settings'"
        variant="outline"
        size="icon"
        aria-label="Settings"
        :as="RouterLink"
        to="/settings"
      >
        <PhGearSix />
      </Button>
    </div>
  </header>
</template>
