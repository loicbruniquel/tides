<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, shallowRef } from 'vue'

import {
  convertedValues,
  getAbsoluteValue,
  getPercentValue,
  yForX,
  type PlotPoint,
} from '@/lib/plot'
import type { TideDay } from '@/types'

import GraphBadges from './graph/GraphBadges.vue'
import GraphExtremeDots from './graph/GraphExtremeDots.vue'
import GraphInfo from './graph/GraphInfo.vue'
import GraphNight from './graph/GraphNight.vue'
import GraphNowMarker from './graph/GraphNowMarker.vue'
import GraphPath from './graph/GraphPath.vue'
import GraphSeparators from './graph/GraphSeparators.vue'
import type { PlottedExtreme } from './graph/types'

const props = defineProps<{
  tides: TideDay
  timeZone: string
  /** Unix seconds, or null when SunCalc reports no sunrise/sunset (polar day or night). */
  sunrise: number | null
  sunset: number | null
}>()

const emit = defineEmits<{ prev: []; next: [] }>()

/* -------------------------------------------------------------------------- */
/* Coordinate space                                                            */
/* -------------------------------------------------------------------------- */

const minX = computed(() => props.tides.heights[0]!.dt)
const maxX = computed(() => props.tides.heights[props.tides.heights.length - 1]!.dt)

function datum(name: string): number | undefined {
  return props.tides.datums?.find((entry) => entry.name === name)?.height
}

/**
 * Deliberately inverted: `minY` is the *highest* astronomical tide and `maxY` the
 * lowest, because SVG's y axis grows downward. See CLAUDE.md — do not "fix" this.
 * Falls back to the day's own range, padded, when the datums are missing.
 */
const minY = computed(
  () => datum('HAT') ?? Math.max(...props.tides.heights.map((h) => h.height)) + 0.5,
)
const maxY = computed(
  () => datum('LAT') ?? Math.min(...props.tides.heights.map((h) => h.height)) - 0.5,
)

const heightData = computed<PlotPoint[]>(() =>
  convertedValues(
    props.tides.heights.map((height) => ({ ...height, x: height.dt, y: height.height })),
    minX.value,
    maxX.value,
    minY.value,
    maxY.value,
  ),
)

const extremeData = computed<PlottedExtreme[]>(() =>
  convertedValues(
    props.tides.extremes.map((extreme) => ({ ...extreme, x: extreme.dt, y: extreme.height })),
    minX.value,
    maxX.value,
    minY.value,
    maxY.value,
  ),
)

const sunrisePercent = computed(() =>
  props.sunrise === null ? null : getPercentValue(props.sunrise, minX.value, maxX.value),
)
const sunsetPercent = computed(() =>
  props.sunset === null ? null : getPercentValue(props.sunset, minX.value, maxX.value),
)

/* -------------------------------------------------------------------------- */
/* Aspect correction                                                           */
/* -------------------------------------------------------------------------- */

const svgEl = ref<SVGSVGElement | null>(null)
const size = ref({ width: 0, height: 0 })

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!svgEl.value) return
  // ResizeObserver fires once on observe, so the first measurement lands in the same
  // frame rather than after a paint with wrong dot radii.
  observer = new ResizeObserver(([entry]) => {
    const box = entry!.contentRect
    size.value = { width: box.width, height: box.height }
  })
  observer.observe(svgEl.value)
})

onScopeDispose(() => observer?.disconnect())

/** The viewBox is 100 wide but 120 tall, hence the 1.2. */
const aspectRatio = computed(() =>
  size.value.height === 0 ? 1 : (size.value.width / size.value.height) * 1.2,
)

function dotWidth(radiusPx: number): number {
  if (size.value.width === 0) return 0
  return (100 / size.value.width) * radiusPx
}

function dotHeight(radiusPx: number): number {
  return dotWidth(radiusPx) * aspectRatio.value
}

/* -------------------------------------------------------------------------- */
/* Scrub + swipe                                                               */
/* -------------------------------------------------------------------------- */

/** Pointer position along the day, 0–100, or null when nothing is being tracked. */
const pointerX = ref<number | null>(null)

const pointerY = computed(() =>
  pointerX.value === null ? null : yForX(heightData.value, pointerX.value),
)
const pointerHeight = computed(() =>
  pointerY.value === null ? null : getAbsoluteValue(pointerY.value, minY.value, maxY.value),
)
const pointerDt = computed(() =>
  pointerX.value === null ? null : getAbsoluteValue(pointerX.value, minX.value, maxX.value),
)

const extremeYs = computed(() => extremeData.value.map((point) => point.y))

/** Blends between the two tide colours by how high the pointer sits in the range. */
const pointerColor = computed(() => {
  const lowest = Math.min(...extremeYs.value)
  const highest = Math.max(...extremeYs.value)
  const span = highest - lowest
  if (pointerY.value === null || span === 0) return 'var(--tide-high)'

  const ratio = Math.min(1, Math.max(0, (pointerY.value - lowest) / span))
  return `color-mix(in oklab, var(--tide-low) ${(ratio * 100).toFixed(1)}%, var(--tide-high))`
})

type GestureMode = 'undecided' | 'scrub' | 'swipe'

interface Gesture {
  id: number
  startX: number
  startY: number
  startedAt: number
  mode: GestureMode
}

/** A flick this far horizontally, this early, is a day change rather than a scrub. */
const SWIPE_CLASSIFY_PX = 24
const SWIPE_CLASSIFY_MS = 250
/** How far that flick must travel before it actually commits to changing the day. */
const SWIPE_COMMIT_PX = 60

const gesture = shallowRef<Gesture | null>(null)

function scrubTo(event: PointerEvent) {
  const el = svgEl.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  if (rect.width === 0) return

  const ratio = (event.clientX - rect.left) / rect.width
  pointerX.value = Math.min(100, Math.max(0, ratio * 100))
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse') {
    scrubTo(event)
    return
  }

  gesture.value = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startedAt: performance.now(),
    mode: 'undecided',
  }
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType === 'mouse') {
    scrubTo(event)
    return
  }

  const current = gesture.value
  if (!current || current.id !== event.pointerId) return

  const dx = event.clientX - current.startX
  const dy = event.clientY - current.startY

  if (current.mode === 'undecided') {
    const elapsed = performance.now() - current.startedAt
    const horizontalFlick =
      Math.abs(dx) > SWIPE_CLASSIFY_PX &&
      Math.abs(dx) > Math.abs(dy) * 2 &&
      elapsed < SWIPE_CLASSIFY_MS

    if (horizontalFlick) {
      current.mode = 'swipe'
    } else if (Math.abs(dx) > 4 || Math.abs(dy) > 4 || elapsed >= SWIPE_CLASSIFY_MS) {
      current.mode = 'scrub'
    }
  }

  if (current.mode === 'scrub') scrubTo(event)
}

function onPointerUp(event: PointerEvent) {
  const current = gesture.value

  if (current?.mode === 'swipe') {
    // Branched rather than `emit(dx < 0 ? 'next' : 'prev')`: the typed-emit overloads
    // cannot accept a union of event names.
    const dx = event.clientX - current.startX
    if (dx <= -SWIPE_COMMIT_PX) emit('next')
    else if (dx >= SWIPE_COMMIT_PX) emit('prev')
  }

  gesture.value = null
  pointerX.value = null
}

function onPointerLeave() {
  if (gesture.value) return
  pointerX.value = null
}
</script>

<template>
  <div class="relative h-[clamp(260px,45vh,420px)] w-full select-none overflow-hidden">
    <svg
      ref="svgEl"
      class="h-full w-full"
      viewBox="0 -10 100 120"
      preserveAspectRatio="none"
      role="img"
      aria-label="Tide height through the day"
    >
      <GraphNight
        v-if="sunrisePercent !== null && sunsetPercent !== null"
        :sunrise="sunrisePercent"
        :sunset="sunsetPercent"
      />
      <rect v-else x="0" y="-10" width="100" height="120" fill="var(--graph-day)" />

      <GraphSeparators />

      <GraphNowMarker :day-start="minX" :day-end="maxX" />

      <GraphPath :height-data="heightData" />

      <GraphExtremeDots
        :extremes="extremeData"
        :dot-width="dotWidth(4)"
        :dot-height="dotHeight(4)"
      />

      <ellipse
        v-if="pointerX !== null && pointerY !== null"
        :cx="pointerX"
        :cy="pointerY"
        :rx="dotWidth(7)"
        :ry="dotHeight(7)"
        stroke-width="0"
        :style="{ fill: pointerColor }"
      />

      <!-- Transparent capture surface. `touch-action: pan-y` lets the page still
           scroll vertically while horizontal drags reach the handlers below. -->
      <rect
        x="0"
        y="-10"
        width="100"
        height="120"
        fill="transparent"
        style="touch-action: pan-y"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerLeave"
      />
    </svg>

    <!-- Inset by 10/120 so this overlay's 0–100% maps onto the SVG's 0–100 band. -->
    <GraphBadges
      class="absolute inset-x-0"
      style="top: 8.3333%; bottom: 8.3333%"
      :extremes="extremeData"
      :time-zone="timeZone"
    />

    <GraphInfo
      v-if="pointerDt !== null && pointerHeight !== null"
      class="absolute left-3 top-3"
      :dt="pointerDt"
      :height="pointerHeight"
      :time-zone="timeZone"
    />
  </div>
</template>
