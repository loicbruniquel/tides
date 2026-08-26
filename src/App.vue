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
  <!-- Banner and header share one sticky, safe-area-padded shell. The inset has to
       live on the outermost element: put it on the header alone and the offline banner
       renders above it, underneath the iOS status bar. -->
  <div
    v-if="showChrome"
    class="safe-top sticky top-0 z-30 bg-background/85 backdrop-blur-md"
  >
    <OfflineBanner />
    <AppHeader />
  </div>

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
