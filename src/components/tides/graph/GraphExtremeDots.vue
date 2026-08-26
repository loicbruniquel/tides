<script setup lang="ts">
import type { PlottedExtreme } from './types'

/**
 * `rx` and `ry` differ because the SVG uses `preserveAspectRatio="none"` — a circle
 * drawn with equal radii would be squashed into an oval by the stretch.
 */
defineProps<{
  extremes: PlottedExtreme[]
  dotWidth: number
  dotHeight: number
}>()
</script>

<template>
  <g>
    <ellipse
      v-for="point in extremes"
      :key="point.dt"
      :cx="point.x"
      :cy="point.y"
      :rx="dotWidth"
      :ry="dotHeight"
      stroke-width="0"
      :fill="point.type === 'Low' ? 'var(--tide-low)' : 'var(--tide-high)'"
    />
  </g>
</template>
