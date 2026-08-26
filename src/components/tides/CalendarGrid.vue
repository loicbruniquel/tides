<script setup lang="ts">
import { PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue'
import { computed, ref, watch } from 'vue'

import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'
import type { IsoDay } from '@/types'

const props = defineProps<{
  modelValue: IsoDay
  /** Today at the station, highlighted distinctly from the selection. */
  today: IsoDay
}>()

const emit = defineEmits<{ 'update:modelValue': [day: IsoDay] }>()

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

/** The month on display, as `[year, month]` with month 1-based. */
const cursor = ref(monthOf(props.modelValue))

watch(
  () => props.modelValue,
  (day) => (cursor.value = monthOf(day)),
)

function monthOf(day: IsoDay): [number, number] {
  const [year, month] = day.split('-').map(Number)
  return [year!, month!]
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function isoFor(year: number, month: number, date: number): IsoDay {
  return `${year}-${pad(month)}-${pad(date)}`
}

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(cursor.value[0], cursor.value[1] - 1, 1))),
)

/** Leading blanks then every date, laid out Monday-first. */
const cells = computed<(IsoDay | null)[]>(() => {
  const [year, month] = cursor.value

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const leading = (firstWeekday + 6) % 7
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate()

  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: total }, (_, index) => isoFor(year, month, index + 1)),
  ]
})

function shiftMonth(delta: number) {
  const [year, month] = cursor.value
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1))
  cursor.value = [shifted.getUTCFullYear(), shifted.getUTCMonth() + 1]
}
</script>

<template>
  <div class="w-[17rem] p-3">
    <div class="mb-2 flex items-center justify-between">
      <Button variant="ghost" size="icon-sm" aria-label="Previous month" @click="shiftMonth(-1)">
        <PhCaretLeft />
      </Button>
      <span class="text-sm font-semibold">{{ monthLabel }}</span>
      <Button variant="ghost" size="icon-sm" aria-label="Next month" @click="shiftMonth(1)">
        <PhCaretRight />
      </Button>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center">
      <span v-for="weekday in WEEKDAYS" :key="weekday" class="text-xs text-muted-foreground">
        {{ weekday }}
      </span>

      <template v-for="(day, index) in cells" :key="day ?? `blank-${index}`">
        <span v-if="day === null" />
        <button
          v-else
          type="button"
          :class="
            cn(
              'flex size-8 items-center justify-center rounded-full text-sm tabular-nums transition-colors hover:bg-accent',
              day === today && day !== modelValue && 'font-semibold text-primary',
              day === modelValue && 'bg-primary text-primary-foreground hover:opacity-90',
            )
          "
          @click="emit('update:modelValue', day)"
        >
          {{ Number(day.slice(8)) }}
        </button>
      </template>
    </div>
  </div>
</template>
