<script setup lang="ts">
import { PhCloudSlash, PhPencilSimple } from '@phosphor-icons/vue'
import suncalc from 'suncalc'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import DateControl from '@/components/tides/DateControl.vue'
import TideGraph from '@/components/tides/TideGraph.vue'
import Button from '@/components/ui/Button.vue'
import { useOnline } from '@/composables/useOnline'
import { prefetchStationDays, useTideDay } from '@/composables/useTides'
import { addDays, formatRelative, middayUtc, timeZoneFor, todayInZone } from '@/lib/time'
import { useSettingsStore } from '@/stores/settings'
import { useStationsStore } from '@/stores/stations'

const route = useRoute()
const router = useRouter()
const stations = useStationsStore()
const settings = useSettingsStore()
const online = useOnline()

const station = computed(() => stations.byId(String(route.params.id)))

const timeZone = computed(() =>
  station.value ? timeZoneFor(station.value.latitude, station.value.longitude) : 'UTC',
)
const today = computed(() => todayInZone(timeZone.value))

const day = ref(todayInZone(timeZone.value))

// A station that no longer exists (deleted on another tab, or a stale deep link).
watch(
  station,
  (current) => {
    if (!current) void router.replace('/')
    else day.value = todayInZone(timeZoneFor(current.latitude, current.longitude))
  },
  { immediate: true },
)

const { data, isFetching, isError, dataUpdatedAt } = useTideDay(
  () => station.value,
  () => day.value,
)

// Warm the next few days so flipping forward — or losing signal — stays instant.
watch(
  [station, day],
  ([current, currentDay]) => {
    if (current) void prefetchStationDays(current, currentDay, settings.prefetchDays)
  },
  { immediate: true },
)

const sun = computed(() => {
  if (!station.value) return null
  return suncalc.getTimes(
    middayUtc(day.value),
    station.value.latitude,
    station.value.longitude,
  )
})

/** SunCalc yields an Invalid Date inside a polar day or night. */
function seconds(value: Date | undefined): number | null {
  if (!value || Number.isNaN(value.getTime())) return null
  return value.getTime() / 1000
}

const sunrise = computed(() => seconds(sun.value?.sunrise))
const sunset = computed(() => seconds(sun.value?.sunset))

/** Shown when we are offline and displaying something we fetched earlier. */
const staleNotice = computed(() => {
  if (online.value || !data.value || !dataUpdatedAt.value) return null
  return `Cached ${formatRelative(dataUpdatedAt.value)}`
})
</script>

<template>
  <div v-if="station" class="mx-auto w-full max-w-3xl px-4 pb-10">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold">{{ station.name }}</h1>
        <p class="text-xs tabular-nums text-muted-foreground">
          {{ station.latitude }}, {{ station.longitude }}
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label="Edit station"
        :as="RouterLink"
        :to="`/stations/${station.id}/edit`"
      >
        <PhPencilSimple />
      </Button>
    </div>

    <div class="relative overflow-hidden rounded-3xl border border-border shadow-sm">
      <!-- Non-blocking: a hairline at the top of the card, never an overlay that
           hides the data already on screen. -->
      <div
        v-if="isFetching"
        class="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/20"
      >
        <div class="h-full w-1/3 animate-[indeterminate_1.2s_ease-in-out_infinite] bg-primary" />
      </div>

      <TideGraph
        v-if="data"
        :tides="data"
        :time-zone="timeZone"
        :sunrise="sunrise"
        :sunset="sunset"
        @prev="day = addDays(day, -1)"
        @next="day = addDays(day, 1)"
      />

      <div
        v-else
        class="flex h-[clamp(260px,45vh,420px)] flex-col items-center justify-center gap-2 bg-card text-center"
      >
        <template v-if="isError">
          <PhCloudSlash class="text-3xl text-muted-foreground" />
          <p class="text-sm text-muted-foreground">
            {{ online ? 'Could not load this day.' : 'Not cached, and you are offline.' }}
          </p>
        </template>
        <p v-else class="text-sm text-muted-foreground">Loading tides…</p>
      </div>
    </div>

    <p v-if="staleNotice" class="mt-2 text-center text-xs text-muted-foreground">
      {{ staleNotice }}
    </p>

    <DateControl v-model="day" :today="today" class="mt-5" />
  </div>
</template>

<style>
@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
</style>
