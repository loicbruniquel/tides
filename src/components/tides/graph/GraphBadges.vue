<script setup lang="ts">
import { formatTime } from '@/lib/time'

import type { PlottedExtreme } from './types'

defineProps<{
  extremes: PlottedExtreme[]
  timeZone: string
}>()

/**
 * High-water labels sit above their dot, low-water labels below, so neither covers the
 * curve. The percentages are within an overlay inset to match the SVG's 0–100 band
 * (see the `inset` on the wrapper in TideGraph.vue).
 */
function badgeStyle(extreme: PlottedExtreme) {
  return {
    left: `${extreme.x}%`,
    top: `${extreme.y}%`,
    transform: `translateX(-50%) translateY(${extreme.type === 'High' ? -140 : 40}%)`,
  }
}
</script>

<template>
  <!-- Positioning comes from the parent: the overlay has to be inset to line its
       0–100% up with the SVG's 0–100 band inside a -10…110 viewBox. -->
  <div class="pointer-events-none">
    <div
      v-for="extreme in extremes"
      :key="extreme.dt"
      class="absolute flex flex-col items-center gap-0.5 whitespace-nowrap"
      :style="badgeStyle(extreme)"
    >
      <span
        class="rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white shadow-sm"
        :style="{
          backgroundColor: extreme.type === 'Low' ? 'var(--tide-low)' : 'var(--tide-high)',
        }"
      >
        {{ formatTime(extreme.dt, timeZone) }}
      </span>
      <span class="text-[0.65rem] font-medium tabular-nums text-muted-foreground">
        {{ extreme.height.toFixed(1) }}m
      </span>
    </div>
  </div>
</template>
