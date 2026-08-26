<script setup lang="ts">
import { PhArrowLeft, PhGearSix } from '@phosphor-icons/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import Button from '@/components/ui/Button.vue'

const route = useRoute()

const isHome = computed(() => route.name === 'stations')
const title = computed(() => (isHome.value ? 'Tides' : (route.meta.title as string) || 'Tides'))
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

      <h1 class="flex-1 truncate text-lg font-semibold">{{ title }}</h1>

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
