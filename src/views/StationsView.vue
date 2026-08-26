<script setup lang="ts">
import { PhPlus, PhWaves } from '@phosphor-icons/vue'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import StationCard from '@/components/stations/StationCard.vue'
import Button from '@/components/ui/Button.vue'
import { refreshTodayForAll } from '@/composables/useTides'
import { timeZoneFor, todayInZone } from '@/lib/time'
import { useStationsStore } from '@/stores/stations'

const stations = useStationsStore()

onMounted(() => {
  // Warm today for every station so this list stays informative without a connection.
  void refreshTodayForAll(
    stations.stations.map((station) => ({
      station,
      day: todayInZone(timeZoneFor(station.latitude, station.longitude)),
    })),
  )
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 pb-24">
    <ul v-if="stations.stations.length" class="flex flex-col gap-3">
      <StationCard
        v-for="station in stations.stations"
        :key="station.id"
        :station="station"
        @move="(delta) => stations.move(station.id, delta)"
      />
    </ul>

    <div
      v-else
      class="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-10 text-center"
    >
      <PhWaves class="text-4xl text-muted-foreground" />
      <div>
        <p class="font-semibold">No stations yet</p>
        <p class="text-sm text-muted-foreground">
          Add a spot on the map to see its tides.
        </p>
      </div>
      <Button :as="RouterLink" to="/stations/new">
        <PhPlus weight="bold" />
        Add a station
      </Button>
    </div>

    <Button
      v-if="stations.stations.length"
      :as="RouterLink"
      to="/stations/new"
      size="icon"
      class="fixed bottom-6 right-6 size-14 shadow-lg"
      aria-label="Add a station"
    >
      <PhPlus weight="bold" class="text-xl" />
    </Button>
  </div>
</template>
