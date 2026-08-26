<script setup lang="ts">
// Drawn from -10 to 120 so the line spans the viewBox's full headroom.
withDefaults(
  defineProps<{
    x: number
    stroke?: string
    strokeWidth?: number
  }>(),
  {
    stroke: 'var(--graph-grid)',
    strokeWidth: 1,
  },
)
</script>

<template>
  <path
    :d="`M${x} -10 L${x} 120`"
    fill="transparent"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    vector-effect="non-scaling-stroke"
  />
</template>
