<script setup lang="ts">
import { PhArrowLeft, PhArrowRight, PhCalendarBlank } from '@phosphor-icons/vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { computed, ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import { addDays, formatDayLong } from '@/lib/time'
import type { IsoDay } from '@/types'

import CalendarGrid from './CalendarGrid.vue'

const props = defineProps<{
  modelValue: IsoDay
  today: IsoDay
}>()

const emit = defineEmits<{ 'update:modelValue': [day: IsoDay] }>()

const open = ref(false)

const label = computed(() => {
  if (props.modelValue === props.today) return 'Today'
  if (props.modelValue === addDays(props.today, 1)) return 'Tomorrow'
  if (props.modelValue === addDays(props.today, -1)) return 'Yesterday'
  return formatDayLong(props.modelValue)
})

const sublabel = computed(() =>
  props.modelValue === props.today ||
  props.modelValue === addDays(props.today, 1) ||
  props.modelValue === addDays(props.today, -1)
    ? formatDayLong(props.modelValue)
    : null,
)

function shift(delta: number) {
  emit('update:modelValue', addDays(props.modelValue, delta))
}

function select(day: IsoDay) {
  emit('update:modelValue', day)
  open.value = false
}
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <Button variant="outline" size="icon" class="size-12 shrink-0" aria-label="Previous day" @click="shift(-1)">
      <PhArrowLeft />
    </Button>

    <PopoverRoot v-model:open="open">
      <PopoverTrigger as-child>
        <Button variant="outline" class="h-12 min-w-0 flex-1 flex-col gap-0 px-4">
          <span class="flex items-center gap-2 text-sm font-semibold">
            <PhCalendarBlank class="text-muted-foreground" />
            {{ label }}
          </span>
          <span v-if="sublabel" class="text-xs font-normal text-muted-foreground">
            {{ sublabel }}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          :side-offset="8"
          class="z-50 rounded-2xl border border-border bg-card shadow-lg"
        >
          <CalendarGrid
            :model-value="modelValue"
            :today="today"
            @update:model-value="select"
          />
          <div class="border-t border-border p-2">
            <Button variant="ghost" size="sm" class="w-full" @click="select(today)">
              Jump to today
            </Button>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>

    <Button variant="outline" size="icon" class="size-12 shrink-0" aria-label="Next day" @click="shift(1)">
      <PhArrowRight />
    </Button>
  </div>
</template>
