<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue'

import GraphVerticalLine from './GraphVerticalLine.vue'

const props = defineProps<{
  /** Unix seconds of the first and last sample of the displayed day. */
  dayStart: number
  dayEnd: number
}>()

const now = ref(Date.now() / 1000)

const timer = window.setInterval(() => {
  now.value = Date.now() / 1000
}, 30_000)

onScopeDispose(() => window.clearInterval(timer))

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
