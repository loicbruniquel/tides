<script setup lang="ts">
import {
  PhArrowDown,
  PhArrowUp,
  PhCaretDown,
  PhCaretUp,
  PhPencilSimple,
} from '@phosphor-icons/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import Button from '@/components/ui/Button.vue'
import { useNow } from '@/composables/useNow'
import { useTideDay } from '@/composables/useTides'
import { heightAt, nextExtreme } from '@/lib/tides'
import { addDays, formatTime, timeZoneFor, todayInZone } from '@/lib/time'
import type { Station } from '@/types'

const props = defineProps<{ station: Station }>()

const emit = defineEmits<{ move: [delta: number] }>()

const timeZone = computed(() => timeZoneFor(props.station.latitude, props.station.longitude))
const today = computed(() => todayInZone(timeZone.value))
const tomorrow = computed(() => addDays(today.value, 1))

const now = useNow()

// Cached-first: with data in IndexedDB this renders instantly and offline.
const { data, isPaused } = useTideDay(
  () => props.station,
  () => today.value,
)

const todayNext = computed(() => nextExtreme(data.value, now.value))

// After the day's last high or low — often several hours before midnight — today's
// payload holds no answer to "what's next", and the card used to fall through to
// "No data yet" despite having the whole curve. Only then is tomorrow worth fetching.
const needsTomorrow = computed(() => data.value !== undefined && todayNext.value === undefined)

const { data: tomorrowData } = useTideDay(
  () => (needsTomorrow.value ? props.station : undefined),
  () => tomorrow.value,
)

const next = computed(() => todayNext.value ?? nextExtreme(tomorrowData.value, now.value))
const level = computed(
  () => heightAt(data.value, now.value) ?? heightAt(tomorrowData.value, now.value),
)
const rising = computed(() => (next.value ? next.value.type === 'High' : undefined))

/** Nothing to show, and nothing on the way: say so rather than implying it is loading. */
const emptyLabel = computed(() =>
  isPaused.value && !data.value ? 'Offline — not cached' : 'No data yet',
)
</script>

<template>
  <li class="group relative">
    <RouterLink
      :to="`/stations/${station.id}`"
      class="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold">{{ station.name }}</p>
        <p class="text-xs tabular-nums text-muted-foreground">
          {{ station.latitude }}, {{ station.longitude }}
        </p>
      </div>

      <div v-if="next" class="text-right">
        <p
          class="flex items-center justify-end gap-1 text-sm font-semibold tabular-nums"
          :style="{ color: next.type === 'Low' ? 'var(--tide-low)' : 'var(--tide-high)' }"
        >
          <PhArrowUp v-if="rising" weight="bold" />
          <PhArrowDown v-else weight="bold" />
          {{ next.type }} {{ formatTime(next.dt, timeZone) }}
        </p>
        <p v-if="level !== undefined" class="text-xs tabular-nums text-muted-foreground">
          now {{ level.toFixed(1) }} m
        </p>
      </div>
      <p v-else class="text-xs text-muted-foreground">{{ emptyLabel }}</p>
    </RouterLink>

    <!-- Revealed on hover on a pointer device; always present for touch and keyboard,
         since there is no hover to reveal them with. -->
    <div
      class="absolute right-2 top-1/2 flex -translate-y-1/2 gap-0.5 rounded-full bg-card/95 p-1 opacity-0 shadow-sm transition-opacity focus-within:opacity-100 group-hover:opacity-100 max-[768px]:opacity-100"
    >
      <Button variant="ghost" size="icon-sm" aria-label="Move up" @click.prevent="emit('move', -1)">
        <PhCaretUp />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Move down"
        @click.prevent="emit('move', 1)"
      >
        <PhCaretDown />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Edit station"
        :as="RouterLink"
        :to="`/stations/${station.id}/edit`"
      >
        <PhPencilSimple />
      </Button>
    </div>
  </li>
</template>
