<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{ class?: string }>()

const model = defineModel<string | number>()
</script>

<template>
  <input
    v-model="model"
    :class="
      cn(
        'h-10 w-full rounded-xl border border-input bg-card px-3 text-base transition-colors sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        $props.class,
      )
    "
  />
</template>
