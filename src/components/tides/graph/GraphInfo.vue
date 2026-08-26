<script setup lang="ts">
import { formatTime } from '@/lib/time'

defineProps<{
  /** Unix seconds under the pointer. */
  dt: number
  /** Interpolated water level in metres. */
  height: number
  timeZone: string
}>()
</script>

<template>
  <div
    class="pointer-events-none flex items-baseline gap-2 rounded-lg bg-card/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm"
  >
    <span class="text-sm font-semibold tabular-nums">{{ formatTime(dt, timeZone) }}</span>
    <span class="text-sm tabular-nums text-muted-foreground">{{ height.toFixed(2) }} m</span>
  </div>
</template>
