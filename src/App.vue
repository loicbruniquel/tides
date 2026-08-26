<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import OfflineBanner from '@/components/layout/OfflineBanner.vue'
import UpdatePrompt from '@/components/layout/UpdatePrompt.vue'

const route = useRoute()

// The map editor is full-bleed and supplies its own controls.
const showChrome = computed(() => route.meta.chrome !== false)
</script>

<template>
  <OfflineBanner v-if="showChrome" />
  <AppHeader v-if="showChrome" />

  <main>
    <RouterView v-slot="{ Component }">
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-100"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <UpdatePrompt />
</template>
