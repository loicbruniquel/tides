<script setup lang="ts">
import { useId } from 'vue'

/**
 * Day/night background bands. `sunrise` and `sunset` are already in the graph's 0–100
 * x space; a soft gradient of `fadeWidth` straddles each so dawn and dusk read as
 * transitions rather than hard edges.
 */
const props = withDefaults(
  defineProps<{
    sunrise: number
    sunset: number
    fadeWidth?: number
  }>(),
  { fadeWidth: 6 },
)

// Unique per instance: the legacy version hard-coded `id="gradient"`, which collides
// as soon as two graphs render on one page.
const uid = useId()
const sunriseId = `night-sunrise-${uid}`
const sunsetId = `night-sunset-${uid}`

const halfFade = () => props.fadeWidth / 2
</script>

<template>
  <g class="night">
    <defs>
      <linearGradient :id="sunriseId" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="var(--graph-night)" />
        <stop offset="100%" stop-color="var(--graph-day)" />
      </linearGradient>
      <linearGradient :id="sunsetId" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="var(--graph-day)" />
        <stop offset="100%" stop-color="var(--graph-night)" />
      </linearGradient>
    </defs>

    <rect x="0" y="-10" width="100" height="120" fill="var(--graph-day)" />

    <rect x="0" y="-10" :width="Math.max(sunrise, 0)" height="120" fill="var(--graph-night)" />
    <rect
      :x="sunrise - halfFade()"
      y="-10"
      :width="fadeWidth"
      height="120"
      :fill="`url(#${sunriseId})`"
    />

    <rect
      :x="sunset"
      y="-10"
      :width="Math.max(100 - sunset, 0)"
      height="120"
      fill="var(--graph-night)"
    />
    <rect
      :x="sunset - halfFade()"
      y="-10"
      :width="fadeWidth"
      height="120"
      :fill="`url(#${sunsetId})`"
    />
  </g>
</template>
