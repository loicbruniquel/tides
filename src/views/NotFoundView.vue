<script setup lang="ts">
import { PhCompass } from '@phosphor-icons/vue'
import { RouterLink } from 'vue-router'

import Button from '@/components/ui/Button.vue'
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
    <PhCompass class="text-4xl text-muted-foreground" />
    <p class="font-semibold">Nothing here</p>
    <p class="text-sm text-muted-foreground">That page does not exist.</p>
    <Button :as="RouterLink" to="/">Back to stations</Button>
  </div>
</template>
