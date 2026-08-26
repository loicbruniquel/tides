<script setup lang="ts">
import { computed, useId } from 'vue'

import { svgPath, type PlotPoint } from '@/lib/plot'

const props = defineProps<{
  heightData: PlotPoint[]
}>()

const uid = useId()
const gradientId = `tide-path-${uid}`

const d = computed(() => svgPath(props.heightData))
</script>

<template>
  <g>
    <defs>
      <!-- Vertical gradient: the curve is high-water coloured at the top of the plot
           and low-water coloured at the bottom, so the colour itself reads as depth. -->
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="var(--tide-high)" />
        <stop offset="100%" stop-color="var(--tide-low)" />
      </linearGradient>
    </defs>

    <path
      :d="d"
      fill="transparent"
      :stroke="`url(#${gradientId})`"
      stroke-width="3"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  </g>
</template>
