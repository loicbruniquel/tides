<script setup lang="ts">
import { computed } from 'vue'

import { useNow } from '@/composables/useNow'

import GraphVerticalLine from './GraphVerticalLine.vue'

const props = defineProps<{
  /** Unix seconds of the first and last sample of the displayed day. */
  dayStart: number
  dayEnd: number
}>()

/**
 * The shared clock, not a private `setInterval`. A backgrounded PWA has its timers
 * frozen, so an interval of our own left the marker wherever it stood when the page
 * was suspended — pointing at yesterday after an overnight resume. `useNow` re-reads
 * the wall clock on every resume signal as well as on a tick.
 */
const now = useNow()

/** Null when "now" falls outside the displayed day, which hides the marker. */
const x = computed(() => {
  const span = props.dayEnd - props.dayStart
  if (span <= 0) return null

  const ratio = (now.value - props.dayStart) / span
  if (ratio < 0 || ratio > 1) return null

  return ratio * 100
})
</script>

<template>
  <GraphVerticalLine
    v-if="x !== null"
    :x="x"
    stroke="var(--graph-now)"
    :stroke-width="1.5"
  />
</template>
