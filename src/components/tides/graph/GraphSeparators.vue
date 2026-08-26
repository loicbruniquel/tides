<script setup lang="ts">
import GraphVerticalLine from './GraphVerticalLine.vue'

// Quarter-day gridlines: 06:00, 12:00 and 18:00 station time.
const QUARTERS = [25, 50, 75]
</script>

<template>
  <g class="separators">
    <GraphVerticalLine v-for="x in QUARTERS" :key="x" :x="x" :stroke-width="1" />

    <path
      d="M 0 50 L 100 50"
      fill="transparent"
      stroke="var(--graph-grid)"
      stroke-width="1"
      stroke-dasharray="4 4"
      vector-effect="non-scaling-stroke"
    />
  </g>
</template>
